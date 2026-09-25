CREATE TABLE public.invite_codes (
  code text PRIMARY KEY,
  owner_user_id uuid NOT NULL,
  owner_email text NOT NULL,
  used_by_email text,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.invite_codes TO authenticated;
GRANT ALL ON public.invite_codes TO service_role;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view own invite codes" ON public.invite_codes FOR SELECT TO authenticated USING (owner_user_id = auth.uid() OR public.is_staff(auth.uid()));

ALTER TABLE public.project_requests ADD COLUMN IF NOT EXISTS referred_by text;

CREATE OR REPLACE FUNCTION public.get_my_invite_codes()
RETURNS SETOF public.invite_codes LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _uid uuid := auth.uid(); _email text; _n int;
BEGIN
  IF _uid IS NULL THEN RETURN; END IF;
  SELECT email INTO _email FROM profiles WHERE user_id = _uid LIMIT 1;
  IF _email IS NULL THEN RETURN; END IF;
  SELECT count(*) INTO _n FROM invite_codes WHERE owner_user_id = _uid;
  WHILE _n < 5 LOOP
    INSERT INTO invite_codes(code, owner_user_id, owner_email)
    VALUES ('RF-' || upper(substr(md5(gen_random_uuid()::text), 1, 6)), _uid, lower(_email))
    ON CONFLICT DO NOTHING;
    _n := _n + 1;
  END LOOP;
  RETURN QUERY SELECT * FROM invite_codes WHERE owner_user_id = _uid ORDER BY created_at, code;
END $$;

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
    RETURN jsonb_build_object('valid', true, 'role', 'user', 'email', _email, 'remaining_uses', 1, 'invite', true);
  END IF;
  IF _email IS NOT NULL AND lower(r.email) <> lower(trim(_email)) THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'email_mismatch');
  END IF;
  IF r.status NOT IN ('approved','redeemed') THEN RETURN jsonb_build_object('valid', false, 'reason', 'not_approved'); END IF;
  IF r.expires_at IS NOT NULL AND r.expires_at <= now() THEN RETURN jsonb_build_object('valid', false, 'reason', 'expired'); END IF;
  IF r.uses_count >= r.max_uses THEN RETURN jsonb_build_object('valid', false, 'reason', 'exhausted'); END IF;
  RETURN jsonb_build_object('valid', true, 'role', r.requested_role, 'email', r.email, 'remaining_uses', r.max_uses - r.uses_count);
END;
$function$;

CREATE OR REPLACE FUNCTION public.consume_beta_code(_code text, _email text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  r public.beta_requests%ROWTYPE; ic public.invite_codes%ROWTYPE;
  target_user_id uuid; target_project_id uuid; role_value public.app_role;
BEGIN
  SELECT * INTO r FROM public.beta_requests
  WHERE upper(code) = upper(trim(_code)) AND lower(email) = lower(trim(_email))
    AND status IN ('approved','redeemed') AND (expires_at IS NULL OR expires_at > now())
    AND uses_count < max_uses
  FOR UPDATE LIMIT 1;

  SELECT user_id INTO target_user_id FROM public.profiles WHERE lower(email) = lower(trim(_email)) LIMIT 1;

  IF r.id IS NULL THEN
    SELECT * INTO ic FROM public.invite_codes WHERE upper(code) = upper(trim(_code)) AND used_at IS NULL FOR UPDATE LIMIT 1;
    IF ic.code IS NULL THEN RETURN jsonb_build_object('ok', false); END IF;
    IF target_user_id IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'profile_missing'); END IF;
    IF target_user_id = ic.owner_user_id THEN RETURN jsonb_build_object('ok', false, 'reason', 'own_code'); END IF;
    UPDATE public.invite_codes SET used_by_email = lower(trim(_email)), used_at = now() WHERE code = ic.code;
    UPDATE public.profiles SET beta_code = ic.code WHERE user_id = target_user_id;
    UPDATE public.profiles SET referral_count = COALESCE(referral_count,0) + 1 WHERE user_id = ic.owner_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'user') ON CONFLICT (user_id, role) DO NOTHING;
    RETURN jsonb_build_object('ok', true, 'role', 'user');
  END IF;

  IF target_user_id IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'profile_missing'); END IF;

  UPDATE public.beta_requests
  SET uses_count = uses_count + 1,
      status = CASE WHEN uses_count + 1 >= max_uses THEN 'redeemed' ELSE 'approved' END,
      reviewed_at = COALESCE(reviewed_at, now())
  WHERE id = r.id;
  UPDATE public.profiles SET beta_code = r.code WHERE user_id = target_user_id;
  BEGIN role_value := r.requested_role::public.app_role;
  EXCEPTION WHEN invalid_text_representation THEN role_value := 'user'::public.app_role; END;
  INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, role_value) ON CONFLICT (user_id, role) DO NOTHING;
  IF r.requested_role = 'project_admin' THEN
    SELECT p.id INTO target_project_id FROM public.projects p WHERE lower(p.contact_email) = lower(r.email) ORDER BY p.created_at DESC LIMIT 1;
    IF target_project_id IS NOT NULL THEN
      INSERT INTO public.project_members (project_id, user_id, email, member_role)
      VALUES (target_project_id, target_user_id, lower(trim(_email)), 'project_admin') ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN jsonb_build_object('ok', true, 'role', r.requested_role, 'project_id', target_project_id);
END;
$function$;