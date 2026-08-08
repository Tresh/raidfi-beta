-- Allow pending (email-only) memberships
ALTER TABLE public.project_members ALTER COLUMN user_id DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS project_members_project_email_key
  ON public.project_members (project_id, lower(email));

-- Members can see rows matching their own email too
DROP POLICY IF EXISTS project_members_select ON public.project_members;
CREATE POLICY project_members_select ON public.project_members
  FOR SELECT TO authenticated
  USING (
    public.is_staff(auth.uid())
    OR user_id = auth.uid()
    OR lower(email) = lower(coalesce(auth.email(), ''))
    OR public.is_project_member(auth.uid(), project_id)
  );

-- is_project_member should also honour email-matched pending rows
CREATE OR REPLACE FUNCTION public.is_project_member(_user_id uuid, _project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = _project_id
      AND (pm.user_id = _user_id
        OR lower(pm.email) = lower(coalesce((SELECT u.email FROM auth.users u WHERE u.id = _user_id), '')))
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_admin(_user_id uuid, _project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = _project_id
      AND pm.member_role IN ('project_admin','owner')
      AND (pm.user_id = _user_id
        OR lower(pm.email) = lower(coalesce((SELECT u.email FROM auth.users u WHERE u.id = _user_id), '')))
  );
$$;

-- Claim pending memberships on sign-in
CREATE OR REPLACE FUNCTION public.claim_project_memberships()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
  IF auth.uid() IS NULL THEN RETURN 0; END IF;
  UPDATE public.project_members
  SET user_id = auth.uid()
  WHERE user_id IS NULL
    AND lower(email) = lower(coalesce(auth.email(), ''));
  GET DIAGNOSTICS n = ROW_COUNT;

  INSERT INTO public.user_roles (user_id, role)
  SELECT auth.uid(), 'project_admin'::public.app_role
  WHERE EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.user_id = auth.uid() AND pm.member_role IN ('project_admin','owner')
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN n;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_project_memberships() TO authenticated;

-- AI config status without exposing the key
DROP VIEW IF EXISTS public.project_ai_config_public;
CREATE OR REPLACE FUNCTION public.project_ai_status(_project_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.project_ai_config%ROWTYPE;
BEGIN
  IF NOT (public.is_project_member(auth.uid(), _project_id) OR public.is_staff(auth.uid())) THEN
    RAISE EXCEPTION 'Not authorized for this project';
  END IF;
  SELECT * INTO r FROM public.project_ai_config WHERE project_id = _project_id;
  IF r.project_id IS NULL THEN
    RETURN jsonb_build_object('connected', false);
  END IF;
  RETURN jsonb_build_object(
    'connected', r.api_key IS NOT NULL,
    'provider', r.provider, 'model', r.model,
    'key_hint', r.key_hint, 'consent_at', r.consent_at
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.project_ai_status(uuid) TO authenticated;