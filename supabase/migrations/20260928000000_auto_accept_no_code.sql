-- Update handle_beta_auto_approve so auto-accepted requests do not generate a code
CREATE OR REPLACE FUNCTION public.handle_beta_auto_approve()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT auto_approve_beta FROM public.admin_settings WHERE id='global') IS TRUE AND NEW.status = 'pending' THEN
    NEW.status := 'approved';
    NEW.code := NULL;
    NEW.reviewed_at := now();
    NEW.expires_at := NULL;
  END IF;
  RETURN NEW;
END $$;

-- Update consume_beta_code to support NULL or empty _code for auto-accepted emails
CREATE OR REPLACE FUNCTION public.consume_beta_code(_code text DEFAULT NULL::text, _email text DEFAULT NULL::text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  r public.beta_requests%ROWTYPE; ic public.invite_codes%ROWTYPE;
  target_user_id uuid; role_value public.app_role;
BEGIN
  IF _code IS NOT NULL AND trim(_code) <> '' THEN
    SELECT * INTO r FROM public.beta_requests
    WHERE upper(code) = upper(trim(_code)) AND lower(email) = lower(trim(_email))
      AND status IN ('approved','redeemed') AND uses_count < max_uses
    FOR UPDATE LIMIT 1;
  ELSE
    SELECT * INTO r FROM public.beta_requests
    WHERE lower(email) = lower(trim(_email))
      AND status IN ('approved','redeemed') AND uses_count < max_uses
    FOR UPDATE LIMIT 1;
  END IF;

  SELECT user_id INTO target_user_id FROM public.profiles WHERE lower(email) = lower(trim(_email)) LIMIT 1;
  IF target_user_id IS NULL THEN
    SELECT id INTO target_user_id FROM auth.users WHERE lower(email) = lower(trim(_email)) LIMIT 1;
  END IF;

  IF r.id IS NULL THEN
    IF _code IS NOT NULL AND trim(_code) <> '' THEN
      SELECT * INTO ic FROM public.invite_codes WHERE upper(code) = upper(trim(_code)) AND used_at IS NULL FOR UPDATE LIMIT 1;
      IF ic.code IS NULL THEN RETURN jsonb_build_object('ok', false); END IF;
      IF lower(ic.owner_email) = lower(trim(_email)) THEN RETURN jsonb_build_object('ok', false, 'reason', 'own_code'); END IF;
      UPDATE public.invite_codes SET used_by_email = lower(trim(_email)), used_at = now() WHERE code = ic.code;
      UPDATE public.profiles SET referral_count = COALESCE(referral_count,0) + 1 WHERE user_id = ic.owner_user_id;
      IF target_user_id IS NOT NULL THEN
        UPDATE public.profiles SET beta_code = ic.code WHERE user_id = target_user_id;
        INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'user') ON CONFLICT (user_id, role) DO NOTHING;
      END IF;
      RETURN jsonb_build_object('ok', true, 'role', 'user');
    END IF;
    RETURN jsonb_build_object('ok', false);
  END IF;

  UPDATE public.beta_requests
  SET uses_count = uses_count + 1,
      status = CASE WHEN uses_count + 1 >= max_uses THEN 'redeemed' ELSE 'approved' END,
      reviewed_at = COALESCE(reviewed_at, now())
  WHERE id = r.id;

  IF target_user_id IS NULL THEN RETURN jsonb_build_object('ok', true, 'role', r.requested_role); END IF;

  UPDATE public.profiles SET beta_code = COALESCE(r.code, 'AUTO_ACCEPTED') WHERE user_id = target_user_id;
  BEGIN
    role_value := r.requested_role::public.app_role;
  EXCEPTION WHEN invalid_text_representation THEN
    role_value := 'user'::public.app_role;
  END;
  INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, role_value) ON CONFLICT (user_id, role) DO NOTHING;

  RETURN jsonb_build_object('ok', true, 'role', r.requested_role);
END;
$function$;
