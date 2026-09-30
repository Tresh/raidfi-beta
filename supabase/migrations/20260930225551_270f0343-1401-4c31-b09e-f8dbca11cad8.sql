DROP FUNCTION IF EXISTS public.consume_beta_code(text, text);

CREATE OR REPLACE FUNCTION public.consume_beta_code(_code text DEFAULT NULL::text, _email text DEFAULT NULL::text, _referred_by text DEFAULT NULL::text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  r public.beta_requests%ROWTYPE;
  ic public.invite_codes%ROWTYPE;
  target_user_id uuid;
  referrer_profile public.profiles%ROWTYPE;
  ref_xp int := 50;
  role_value public.app_role;
  already_has_role boolean := false;
  clean_email text := lower(trim(COALESCE(_email, '')));
  clean_code text := upper(trim(COALESCE(_code, '')));
  clean_ref text := trim(COALESCE(_referred_by, ''));
BEGIN
  IF clean_email = '' THEN RETURN jsonb_build_object('ok', false, 'reason', 'email_required'); END IF;
  IF auth.email() IS NOT NULL AND lower(auth.email()) <> clean_email AND auth.uid() IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'email_mismatch');
  END IF;

  SELECT user_id INTO target_user_id FROM public.profiles WHERE lower(email) = clean_email LIMIT 1;
  IF target_user_id IS NULL THEN
    SELECT id INTO target_user_id FROM auth.users WHERE lower(email) = clean_email LIMIT 1;
  END IF;
  IF target_user_id IS NOT NULL THEN
    SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = target_user_id) INTO already_has_role;
  END IF;

  -- Only burn a beta code on first activation (never on normal sign-ins)
  IF NOT already_has_role THEN
    IF clean_code <> '' THEN
      SELECT * INTO r FROM public.beta_requests
      WHERE upper(code) = clean_code AND lower(email) = clean_email
        AND status IN ('approved','redeemed') AND uses_count < max_uses FOR UPDATE LIMIT 1;
    ELSE
      SELECT * INTO r FROM public.beta_requests
      WHERE lower(email) = clean_email AND status IN ('approved','redeemed') AND uses_count < max_uses
      ORDER BY created_at DESC FOR UPDATE LIMIT 1;
    END IF;

    IF r.id IS NULL AND clean_code <> '' THEN
      SELECT * INTO ic FROM public.invite_codes WHERE upper(code) = clean_code AND used_at IS NULL FOR UPDATE LIMIT 1;
      IF ic.code IS NOT NULL THEN
        IF lower(ic.owner_email) = clean_email THEN RETURN jsonb_build_object('ok', false, 'reason', 'own_code'); END IF;
        UPDATE public.invite_codes SET used_by_email = clean_email, used_at = now() WHERE code = ic.code;
        clean_ref := ic.code; -- invite code owner always gets the credit
      END IF;
    END IF;

    IF r.id IS NOT NULL THEN
      UPDATE public.beta_requests
      SET uses_count = uses_count + 1,
          status = CASE WHEN uses_count + 1 >= max_uses THEN 'redeemed' ELSE 'approved' END,
          reviewed_at = COALESCE(reviewed_at, now()), expires_at = NULL
      WHERE id = r.id;
    END IF;
  END IF;

  IF clean_ref = '' THEN
    SELECT trim(referred_by) INTO clean_ref FROM public.beta_requests
    WHERE lower(email) = clean_email AND COALESCE(trim(referred_by),'') <> '' ORDER BY created_at DESC LIMIT 1;
  END IF;
  IF COALESCE(clean_ref,'') = '' THEN
    SELECT trim(referred_by) INTO clean_ref FROM public.waitlist_submissions
    WHERE lower(email) = clean_email AND COALESCE(trim(referred_by),'') <> '' LIMIT 1;
  END IF;
  clean_ref := COALESCE(clean_ref, '');

  IF target_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE lower(email) = clean_email) THEN
    INSERT INTO public.profiles (user_id, email, waitlist_completed, referral_code, beta_code)
    VALUES (target_user_id, clean_email, true, public.generate_referral_code(),
            COALESCE(NULLIF(r.code, ''), NULLIF(ic.code, ''), 'AUTO_ACCEPTED'))
    ON CONFLICT DO NOTHING;
  END IF;

  UPDATE public.profiles
  SET referral_code = COALESCE(NULLIF(referral_code,''), public.generate_referral_code()),
      beta_code = COALESCE(beta_code, NULLIF(r.code, ''), NULLIF(ic.code, ''), 'AUTO_ACCEPTED')
  WHERE lower(email) = clean_email;

  IF clean_ref <> '' THEN
    SELECT p.* INTO referrer_profile FROM public.invite_codes ic_ref
    JOIN public.profiles p ON p.user_id = ic_ref.owner_user_id
    WHERE upper(ic_ref.code) = upper(clean_ref) LIMIT 1;
    IF referrer_profile.id IS NULL THEN
      SELECT * INTO referrer_profile FROM public.profiles
      WHERE upper(referral_code) = upper(clean_ref) OR lower(email) = lower(clean_ref) LIMIT 1;
    END IF;

    IF referrer_profile.id IS NOT NULL AND lower(referrer_profile.email) <> clean_email
       AND EXISTS (SELECT 1 FROM public.profiles WHERE lower(email) = clean_email AND COALESCE(trim(referred_by),'') = '') THEN
      UPDATE public.profiles SET referred_by = referrer_profile.referral_code WHERE lower(email) = clean_email;
      SELECT COALESCE(referral_xp_per_signup, 50) INTO ref_xp FROM public.admin_settings WHERE id = 'global';
      ref_xp := COALESCE(ref_xp, 50);
      UPDATE public.profiles SET referral_count = COALESCE(referral_count, 0) + 1,
             total_points = COALESCE(total_points, 0) + ref_xp
      WHERE user_id = referrer_profile.user_id;
      INSERT INTO public.user_activities (user_email, activity_type, points, description)
      VALUES (referrer_profile.email, 'referral', ref_xp, 'Referred ' || clean_email);
    END IF;
  END IF;

  IF target_user_id IS NOT NULL AND NOT already_has_role THEN
    BEGIN role_value := COALESCE(r.requested_role, 'user')::public.app_role;
    EXCEPTION WHEN invalid_text_representation THEN role_value := 'user'::public.app_role; END;
    INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, role_value) ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN jsonb_build_object('ok', true, 'role', COALESCE(r.requested_role, 'user'));
END;
$function$;

GRANT EXECUTE ON FUNCTION public.consume_beta_code(text, text, text) TO anon, authenticated;