ALTER TABLE public.admin_settings ADD COLUMN IF NOT EXISTS auto_approve_beta boolean NOT NULL DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;

UPDATE public.beta_requests SET expires_at = NULL WHERE status IN ('approved','redeemed');

CREATE OR REPLACE FUNCTION public.handle_beta_auto_approve()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT auto_approve_beta FROM public.admin_settings WHERE id='global') IS TRUE AND NEW.status = 'pending' THEN
    NEW.status := 'approved';
    NEW.code := COALESCE(NEW.code, 'RB-' || upper(substr(md5(gen_random_uuid()::text),1,8)));
    NEW.reviewed_at := now();
    NEW.expires_at := NULL;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_beta_auto_approve ON public.beta_requests;
CREATE TRIGGER trg_beta_auto_approve BEFORE INSERT ON public.beta_requests FOR EACH ROW EXECUTE FUNCTION public.handle_beta_auto_approve();

CREATE OR REPLACE FUNCTION public.check_email_exists(check_email text)
 RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF EXISTS (SELECT 1 FROM waitlist_submissions WHERE email = check_email) THEN RETURN true; END IF;
  IF EXISTS (SELECT 1 FROM validation_submissions WHERE email = check_email) THEN RETURN true; END IF;
  IF EXISTS (SELECT 1 FROM profiles WHERE email = check_email) THEN RETURN true; END IF;
  IF EXISTS (SELECT 1 FROM beta_requests WHERE lower(email) = lower(check_email) AND status IN ('approved','redeemed')) THEN RETURN true; END IF;
  RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_my_invite_codes()
 RETURNS SETOF invite_codes LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _email text; _n int;
BEGIN
  IF _uid IS NULL THEN RETURN; END IF;
  SELECT email INTO _email FROM profiles WHERE user_id = _uid LIMIT 1;
  _email := COALESCE(_email, auth.email());
  IF _email IS NULL THEN RETURN; END IF;
  SELECT count(*) INTO _n FROM invite_codes WHERE owner_user_id = _uid;
  WHILE _n < 5 LOOP
    INSERT INTO invite_codes(code, owner_user_id, owner_email)
    VALUES ('RF-' || upper(substr(md5(gen_random_uuid()::text), 1, 6)), _uid, lower(_email))
    ON CONFLICT DO NOTHING;
    _n := _n + 1;
  END LOOP;
  RETURN QUERY SELECT * FROM invite_codes WHERE owner_user_id = _uid ORDER BY created_at, code;
END $function$;

CREATE OR REPLACE FUNCTION public.consume_beta_code(_code text, _email text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  r public.beta_requests%ROWTYPE; ic public.invite_codes%ROWTYPE;
  target_user_id uuid; target_project_id uuid; role_value public.app_role;
BEGIN
  SELECT * INTO r FROM public.beta_requests
  WHERE upper(code) = upper(trim(_code)) AND lower(email) = lower(trim(_email))
    AND status IN ('approved','redeemed') AND uses_count < max_uses
  FOR UPDATE LIMIT 1;

  SELECT user_id INTO target_user_id FROM public.profiles WHERE lower(email) = lower(trim(_email)) LIMIT 1;
  IF target_user_id IS NULL THEN
    SELECT id INTO target_user_id FROM auth.users WHERE lower(email) = lower(trim(_email)) LIMIT 1;
  END IF;

  IF r.id IS NULL THEN
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

  UPDATE public.beta_requests
  SET uses_count = uses_count + 1,
      status = CASE WHEN uses_count + 1 >= max_uses THEN 'redeemed' ELSE 'approved' END,
      reviewed_at = COALESCE(reviewed_at, now())
  WHERE id = r.id;
  IF target_user_id IS NULL THEN RETURN jsonb_build_object('ok', true, 'role', r.requested_role); END IF;
  UPDATE public.profiles SET beta_code = r.code WHERE user_id = target_user_id;
  BEGIN role_value := r.requested_role::public.app_role;
  EXCEPTION WHEN invalid_text_representation THEN role_value := 'user'::public.app_role; END;
  INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, role_value) ON CONFLICT (user_id, role) DO NOTHING;
  RETURN jsonb_build_object('ok', true, 'role', r.requested_role);
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_beta_code(_code text, _email text DEFAULT NULL::text)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE r public.beta_requests%ROWTYPE; ic public.invite_codes%ROWTYPE;
BEGIN
  SELECT * INTO r FROM public.beta_requests WHERE upper(code) = upper(trim(_code)) LIMIT 1;
  IF r.id IS NULL THEN
    SELECT * INTO ic FROM public.invite_codes WHERE upper(code) = upper(trim(_code)) LIMIT 1;
    IF ic.code IS NULL THEN RETURN jsonb_build_object('valid', false, 'reason', 'unknown'); END IF;
    IF ic.used_at IS NOT NULL THEN RETURN jsonb_build_object('valid', false, 'reason', 'exhausted'); END IF;
    IF _email IS NOT NULL AND lower(ic.owner_email) = lower(trim(_email)) THEN RETURN jsonb_build_object('valid', false, 'reason', 'own_code'); END IF;
    RETURN jsonb_build_object('valid', true, 'role', 'user', 'email', _email, 'invite', true);
  END IF;
  IF _email IS NOT NULL AND lower(r.email) <> lower(trim(_email)) THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'email_mismatch');
  END IF;
  IF r.status NOT IN ('approved','redeemed') THEN RETURN jsonb_build_object('valid', false, 'reason', 'not_approved'); END IF;
  IF r.uses_count >= r.max_uses THEN RETURN jsonb_build_object('valid', false, 'reason', 'exhausted'); END IF;
  RETURN jsonb_build_object('valid', true, 'role', r.requested_role, 'email', r.email);
END;
$function$;