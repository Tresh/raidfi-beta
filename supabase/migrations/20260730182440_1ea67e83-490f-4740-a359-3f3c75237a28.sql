
-- 1. X handle verification on profiles (additive)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS x_username text,
  ADD COLUMN IF NOT EXISTS x_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS x_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS beta_code text;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_x_username_unique
  ON public.profiles (lower(x_username)) WHERE x_username IS NOT NULL;

-- 2. Beta access requests
CREATE TABLE IF NOT EXISTS public.beta_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  x_handle text,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  code text,
  expires_at timestamptz,
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.beta_requests TO authenticated;
GRANT INSERT ON public.beta_requests TO anon;
GRANT ALL ON public.beta_requests TO service_role;
ALTER TABLE public.beta_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can request beta access" ON public.beta_requests;
CREATE POLICY "Anyone can request beta access" ON public.beta_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage beta requests" ON public.beta_requests;
CREATE POLICY "Admins manage beta requests" ON public.beta_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- 3. Feedback / reports
CREATE TABLE IF NOT EXISTS public.feedback_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text NOT NULL,
  kind text NOT NULL DEFAULT 'feedback',
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback_reports TO authenticated;
GRANT ALL ON public.feedback_reports TO service_role;
ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users create own feedback" ON public.feedback_reports;
CREATE POLICY "Users create own feedback" ON public.feedback_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own feedback" ON public.feedback_reports;
CREATE POLICY "Users read own feedback" ON public.feedback_reports
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS "Admins manage feedback" ON public.feedback_reports;
CREATE POLICY "Admins manage feedback" ON public.feedback_reports
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Ensure a default 'user' role for the calling user
CREATE OR REPLACE FUNCTION public.ensure_user_role()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- 5. Redeem a beta code (returns true when valid + marks it used)
CREATE OR REPLACE FUNCTION public.redeem_beta_code(_code text, _email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req public.beta_requests%ROWTYPE;
BEGIN
  SELECT * INTO req FROM public.beta_requests
  WHERE upper(code) = upper(trim(_code))
    AND status = 'approved'
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;

  IF req.id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.beta_requests SET status = 'redeemed', reviewed_at = COALESCE(reviewed_at, now())
  WHERE id = req.id;

  UPDATE public.profiles SET beta_code = req.code WHERE lower(email) = lower(trim(_email));
  RETURN true;
END;
$$;

-- 6. Check if an X handle is already claimed
CREATE OR REPLACE FUNCTION public.x_handle_taken(_handle text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE lower(x_username) = lower(ltrim(trim(_handle), '@'))
      AND user_id IS DISTINCT FROM auth.uid()
  );
$$;
