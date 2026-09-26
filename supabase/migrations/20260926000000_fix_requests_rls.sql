-- Enable RLS and add policies for beta_requests and project_requests

-- beta_requests
ALTER TABLE public.beta_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.beta_requests TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Anyone can insert beta requests" ON public.beta_requests;
CREATE POLICY "Anyone can insert beta requests"
  ON public.beta_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can view and manage beta requests" ON public.beta_requests;
CREATE POLICY "Staff can view and manage beta requests"
  ON public.beta_requests
  FOR ALL
  TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- project_requests
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_requests TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Anyone can insert project requests" ON public.project_requests;
CREATE POLICY "Anyone can insert project requests"
  ON public.project_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can view and manage project requests" ON public.project_requests;
CREATE POLICY "Staff can view and manage project requests"
  ON public.project_requests
  FOR ALL
  TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));
