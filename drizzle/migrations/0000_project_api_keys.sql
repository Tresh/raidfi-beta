CREATE TABLE public.project_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Default',
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  scope text NOT NULL DEFAULT 'reputation' CHECK (scope IN ('reputation','full')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
GRANT SELECT, UPDATE ON public.project_api_keys TO authenticated;
GRANT ALL ON public.project_api_keys TO service_role;
ALTER TABLE public.project_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project admins view keys" ON public.project_api_keys FOR SELECT TO authenticated
  USING (public.is_project_admin(auth.uid(), project_id) OR public.is_staff(auth.uid()));
CREATE POLICY "Project admins revoke keys" ON public.project_api_keys FOR UPDATE TO authenticated
  USING (public.is_project_admin(auth.uid(), project_id) OR public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.create_project_api_key(_project_id uuid, _name text, _scope text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE raw text;
BEGIN
  IF NOT (public.is_project_admin(auth.uid(), _project_id) OR public.is_staff(auth.uid())) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF _scope NOT IN ('reputation','full') THEN RAISE EXCEPTION 'Invalid scope'; END IF;
  raw := 'rf_live_' || replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','');
  INSERT INTO public.project_api_keys(project_id, name, key_hash, key_prefix, scope, created_by)
  VALUES (_project_id, COALESCE(NULLIF(trim(_name),''),'Default'), encode(extensions.digest(raw,'sha256'),'hex'), left(raw,14), _scope, auth.uid());
  RETURN raw;
END $$;
REVOKE ALL ON FUNCTION public.create_project_api_key(uuid,text,text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.create_project_api_key(uuid,text,text) TO authenticated;