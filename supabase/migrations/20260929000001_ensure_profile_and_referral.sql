-- Migration: Ensure profile creation on consume_beta_code, fallback referral lookup, and retroactive referral backfill

CREATE OR REPLACE FUNCTION public.consume_beta_code(
  _code text DEFAULT NULL::text,
  _email text DEFAULT NULL::text,
  _referred_by text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.beta_requests%ROWTYPE;
  ic public.invite_codes%ROWTYPE;
  target_user_id uuid;
  referrer_profile public.profiles%ROWTYPE;
  ref_code_used text;
  ref_xp int := 50;
  role_value public.app_role;
  clean_email text := lower(trim(COALESCE(_email, '')));
  clean_code text := upper(trim(COALESCE(_code, '')));
  clean_ref text := trim(COALESCE(_referred_by, ''));
BEGIN
  IF clean_email = '' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'email_required');
  END IF;

  -- Find target user_id in profiles or auth.users
  SELECT user_id INTO target_user_id FROM public.profiles WHERE lower(email) = clean_email LIMIT 1;
  IF target_user_id IS NULL THEN
    SELECT id INTO target_user_id FROM auth.users WHERE lower(email) = clean_email LIMIT 1;
  END IF;

  -- Try matching beta_requests
  IF clean_code <> '' THEN
    SELECT * INTO r FROM public.beta_requests
    WHERE upper(code) = clean_code AND lower(email) = clean_email
      AND status IN ('approved','redeemed') AND uses_count < max_uses
    FOR UPDATE LIMIT 1;
  ELSE
    SELECT * INTO r FROM public.beta_requests
    WHERE lower(email) = clean_email
      AND status IN ('approved','redeemed') AND uses_count < max_uses
    FOR UPDATE LIMIT 1;
  END IF;

  -- If r is NOT found, try matching invite_codes
  IF r.id IS NULL AND clean_code <> '' THEN
    SELECT * INTO ic FROM public.invite_codes WHERE upper(code) = clean_code AND used_at IS NULL FOR UPDATE LIMIT 1;
    IF ic.code IS NOT NULL THEN
      IF lower(ic.owner_email) = clean_email THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'own_code');
      END IF;
      UPDATE public.invite_codes SET used_by_email = clean_email, used_at = now() WHERE code = ic.code;
      clean_ref := COALESCE(NULLIF(clean_ref, ''), ic.code);
    END IF;
  END IF;

  -- Update beta_requests if found
  IF r.id IS NOT NULL THEN
    UPDATE public.beta_requests
    SET uses_count = uses_count + 1,
        status = CASE WHEN uses_count + 1 >= max_uses THEN 'redeemed' ELSE 'approved' END,
        reviewed_at = COALESCE(reviewed_at, now())
    WHERE id = r.id;
    IF clean_ref = '' AND r.referred_by IS NOT NULL THEN
      clean_ref := trim(r.referred_by);
    END IF;
  END IF;

  -- Fallback lookup for referred_by if still empty
  IF clean_ref = '' THEN
    SELECT trim(referred_by) INTO clean_ref FROM public.beta_requests WHERE lower(email) = clean_email AND referred_by IS NOT NULL AND trim(referred_by) <> '' LIMIT 1;
  END IF;
  IF clean_ref = '' THEN
    SELECT trim(referred_by) INTO clean_ref FROM public.waitlist_submissions WHERE lower(email) = clean_email AND referred_by IS NOT NULL AND trim(referred_by) <> '' LIMIT 1;
  END IF;

  -- Ensure target profile row exists in public.profiles
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE lower(email) = clean_email) THEN
    INSERT INTO public.profiles (user_id, email, waitlist_completed, referral_code, beta_code)
    VALUES (
      COALESCE(target_user_id, gen_random_uuid()),
      clean_email,
      true,
      public.generate_referral_code(),
      COALESCE(NULLIF(r.code, ''), NULLIF(ic.code, ''), 'AUTO_ACCEPTED')
    )
    ON CONFLICT (email) DO NOTHING;
  END IF;

  -- Re-fetch target_user_id from profiles
  SELECT user_id INTO target_user_id FROM public.profiles WHERE lower(email) = clean_email LIMIT 1;

  -- Update profile referral_code and beta_code if needed
  UPDATE public.profiles
  SET referral_code = COALESCE(referral_code, public.generate_referral_code()),
      beta_code = COALESCE(beta_code, NULLIF(r.code, ''), NULLIF(ic.code, ''), 'AUTO_ACCEPTED')
  WHERE lower(email) = clean_email;

  -- Process referral attribution and award referral XP to referrer
  IF clean_ref <> '' THEN
    SELECT * INTO referrer_profile FROM public.profiles
    WHERE upper(referral_code) = upper(clean_ref)
       OR lower(email) = lower(clean_ref)
       OR user_id::text = clean_ref
    LIMIT 1;

    IF referrer_profile.id IS NULL THEN
      SELECT p.* INTO referrer_profile
      FROM public.invite_codes ic_ref
      JOIN public.profiles p ON p.user_id = ic_ref.owner_user_id
      WHERE upper(ic_ref.code) = upper(clean_ref)
      LIMIT 1;
    END IF;

    IF referrer_profile.id IS NOT NULL AND (target_user_id IS NULL OR referrer_profile.user_id <> target_user_id) AND lower(referrer_profile.email) <> clean_email THEN
      IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE lower(email) = clean_email AND referred_by IS NOT NULL AND trim(referred_by) <> '') THEN
        ref_code_used := COALESCE(referrer_profile.referral_code, clean_ref);

        UPDATE public.profiles SET referred_by = ref_code_used WHERE lower(email) = clean_email;

        SELECT COALESCE(referral_xp_per_signup, 50) INTO ref_xp FROM public.admin_settings WHERE id = 'global';

        UPDATE public.profiles
        SET referral_count = COALESCE(referral_count, 0) + 1,
            total_points = COALESCE(total_points, 0) + ref_xp
        WHERE user_id = referrer_profile.user_id;

        INSERT INTO public.user_activities (user_id, user_email, activity_type, points, description)
        VALUES (
          referrer_profile.user_id,
          referrer_profile.email,
          'referral',
          ref_xp,
          'Referred user ' || clean_email
        );
      END IF;
    END IF;
  END IF;

  -- Assign user role if target_user_id exists
  IF target_user_id IS NOT NULL THEN
    BEGIN
      role_value := COALESCE(r.requested_role, 'user')::public.app_role;
    EXCEPTION WHEN invalid_text_representation THEN
      role_value := 'user'::public.app_role;
    END;
    INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, role_value) ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN jsonb_build_object('ok', true, 'role', COALESCE(r.requested_role, 'user'));
END;
$$;

-- Retroactive backfill processing
DO $$
DECLARE
  p RECORD;
  ref_val text;
BEGIN
  FOR p IN SELECT id, user_id, email FROM public.profiles LOOP
    ref_val := NULL;
    SELECT trim(referred_by) INTO ref_val FROM public.beta_requests WHERE lower(email) = lower(p.email) AND referred_by IS NOT NULL AND trim(referred_by) <> '' LIMIT 1;
    IF ref_val IS NULL THEN
      SELECT trim(referred_by) INTO ref_val FROM public.waitlist_submissions WHERE lower(email) = lower(p.email) AND referred_by IS NOT NULL AND trim(referred_by) <> '' LIMIT 1;
    END IF;
    IF ref_val IS NOT NULL THEN
      PERFORM public.consume_beta_code(NULL, p.email, ref_val);
    END IF;
  END LOOP;
END $$;
