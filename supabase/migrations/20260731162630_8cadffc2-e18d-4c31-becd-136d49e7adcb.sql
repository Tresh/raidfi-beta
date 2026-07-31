-- 1. Roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'project_admin';

-- 2. Beta requests extras
ALTER TABLE public.beta_requests
  ADD COLUMN IF NOT EXISTS requested_role text NOT NULL DEFAULT 'contributor',
  ADD COLUMN IF NOT EXISTS max_uses integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS uses_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid;

-- 3. Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  website text,
  x_handle text,
  telegram text,
  discord text,
  founder_name text,
  contact_email text NOT NULL,
  description text,
  verification text NOT NULL DEFAULT 'unverified',
  status text NOT NULL DEFAULT 'active',
  trust_score integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  email text NOT NULL,
  member_role text NOT NULL DEFAULT 'owner',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT ALL ON public.project_members TO service_role;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.project_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name text NOT NULL,
  website text,
  x_handle text,
  telegram text,
  discord text,
  founder_name text NOT NULL,
  email text NOT NULL,
  why text,
  status text NOT NULL DEFAULT 'pending',
  code text,
  expires_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.project_requests TO authenticated;
GRANT INSERT ON public.project_requests TO anon, authenticated;
GRANT ALL ON public.project_requests TO service_role;
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

-- 4. Helper: is this user any kind of staff?
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text IN ('admin','super_admin','moderator')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_or_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text IN ('admin','super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_member(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE user_id = _user_id AND project_id = _project_id
  );
$$;

-- 5. Policies
DROP POLICY IF EXISTS "projects_select" ON public.projects;
CREATE POLICY "projects_select" ON public.projects FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) OR public.is_project_member(auth.uid(), id));

DROP POLICY IF EXISTS "projects_admin_write" ON public.projects;
CREATE POLICY "projects_admin_write" ON public.projects FOR ALL TO authenticated
USING (public.is_super_or_admin(auth.uid()))
WITH CHECK (public.is_super_or_admin(auth.uid()));

DROP POLICY IF EXISTS "project_members_select" ON public.project_members;
CREATE POLICY "project_members_select" ON public.project_members FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) OR user_id = auth.uid() OR public.is_project_member(auth.uid(), project_id));

DROP POLICY IF EXISTS "project_members_admin_write" ON public.project_members;
CREATE POLICY "project_members_admin_write" ON public.project_members FOR ALL TO authenticated
USING (public.is_super_or_admin(auth.uid()))
WITH CHECK (public.is_super_or_admin(auth.uid()));

DROP POLICY IF EXISTS "project_requests_insert_any" ON public.project_requests;
CREATE POLICY "project_requests_insert_any" ON public.project_requests FOR INSERT TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "project_requests_admin_read" ON public.project_requests;
CREATE POLICY "project_requests_admin_read" ON public.project_requests FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "project_requests_admin_write" ON public.project_requests;
CREATE POLICY "project_requests_admin_write" ON public.project_requests FOR UPDATE TO authenticated
USING (public.is_super_or_admin(auth.uid()))
WITH CHECK (public.is_super_or_admin(auth.uid()));

-- 6. updated_at trigger for projects
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS projects_updated_at ON public.projects;
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
