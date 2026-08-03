ALTER TABLE public.project_requests
  ADD COLUMN IF NOT EXISTS request_types text[] NOT NULL DEFAULT ARRAY['project_workspace']::text[],
  ADD COLUMN IF NOT EXISTS goal text,
  ADD COLUMN IF NOT EXISTS expectations text,
  ADD COLUMN IF NOT EXISTS investment_ready boolean,
  ADD COLUMN IF NOT EXISTS estimated_budget text,
  ADD COLUMN IF NOT EXISTS telegram_group_id text,
  ADD COLUMN IF NOT EXISTS telegram_bot_added boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS raidfi_community_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS logo_data_url text;

CREATE OR REPLACE FUNCTION public.check_beta_code(_code text, _email text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r public.beta_requests%ROWTYPE;
BEGIN
  SELECT * INTO r FROM public.beta_requests
  WHERE upper(code) = upper(trim(_code)) LIMIT 1;
  IF r.id IS NULL THEN RETURN jsonb_build_object('valid', false, 'reason', 'unknown'); END IF;
  IF _email IS NOT NULL AND lower(r.email) <> lower(trim(_email)) THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'email_mismatch');
  END IF;
  IF r.status NOT IN ('approved','redeemed') THEN RETURN jsonb_build_object('valid', false, 'reason', 'not_approved'); END IF;
  IF r.expires_at IS NOT NULL AND r.expires_at <= now() THEN RETURN jsonb_build_object('valid', false, 'reason', 'expired'); END IF;
  IF r.uses_count >= r.max_uses THEN RETURN jsonb_build_object('valid', false, 'reason', 'exhausted'); END IF;
  RETURN jsonb_build_object('valid', true, 'role', r.requested_role, 'email', r.email, 'remaining_uses', r.max_uses - r.uses_count);
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_beta_code(_code text, _email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.beta_requests%ROWTYPE;
  target_user_id uuid;
  target_project_id uuid;
  role_value public.app_role;
BEGIN
  SELECT * INTO r FROM public.beta_requests
  WHERE upper(code) = upper(trim(_code))
    AND lower(email) = lower(trim(_email))
    AND status IN ('approved','redeemed')
    AND (expires_at IS NULL OR expires_at > now())
    AND uses_count < max_uses
  FOR UPDATE
  LIMIT 1;

  IF r.id IS NULL THEN RETURN jsonb_build_object('ok', false); END IF;

  SELECT user_id INTO target_user_id FROM public.profiles
  WHERE lower(email) = lower(trim(_email)) LIMIT 1;
  IF target_user_id IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'profile_missing'); END IF;

  UPDATE public.beta_requests
  SET uses_count = uses_count + 1,
      status = CASE WHEN uses_count + 1 >= max_uses THEN 'redeemed' ELSE 'approved' END,
      reviewed_at = COALESCE(reviewed_at, now())
  WHERE id = r.id;

  UPDATE public.profiles SET beta_code = r.code WHERE user_id = target_user_id;

  BEGIN
    role_value := r.requested_role::public.app_role;
  EXCEPTION WHEN invalid_text_representation THEN
    role_value := 'user'::public.app_role;
  END;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, role_value)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF r.requested_role = 'project_admin' THEN
    SELECT p.id INTO target_project_id
    FROM public.projects p
    WHERE lower(p.contact_email) = lower(r.email)
    ORDER BY p.created_at DESC LIMIT 1;

    IF target_project_id IS NOT NULL THEN
      INSERT INTO public.project_members (project_id, user_id, email, member_role)
      VALUES (target_project_id, target_user_id, lower(trim(_email)), 'project_admin')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN jsonb_build_object('ok', true, 'role', r.requested_role, 'project_id', target_project_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_beta_code(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_beta_code(text, text) TO authenticated;