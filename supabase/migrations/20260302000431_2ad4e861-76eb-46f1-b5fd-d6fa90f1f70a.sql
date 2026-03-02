
-- ==========================================
-- FIX: waitlist_submissions RLS policies
-- ==========================================
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.waitlist_submissions;
DROP POLICY IF EXISTS "Users can read own submission" ON public.waitlist_submissions;
DROP POLICY IF EXISTS "Users can update own submission" ON public.waitlist_submissions;
DROP POLICY IF EXISTS "Admins can read all waitlist" ON public.waitlist_submissions;
DROP POLICY IF EXISTS "Admins can update all waitlist" ON public.waitlist_submissions;
DROP POLICY IF EXISTS "Admins can delete waitlist" ON public.waitlist_submissions;
DROP POLICY IF EXISTS "Allow anonymous waitlist signup" ON public.waitlist_submissions;
DROP POLICY IF EXISTS "Allow anonymous waitlist points update" ON public.waitlist_submissions;
DROP POLICY IF EXISTS "Allow all inserts for waitlist" ON public.waitlist_submissions;

-- Permissive: anonymous signup
CREATE POLICY "Allow anonymous waitlist signup"
ON public.waitlist_submissions AS PERMISSIVE
FOR INSERT TO anon, authenticated
WITH CHECK (user_id IS NULL);

-- Permissive: anonymous points update (for validation bonus)
CREATE POLICY "Allow anonymous waitlist points update"
ON public.waitlist_submissions AS PERMISSIVE
FOR UPDATE TO anon, authenticated
USING (true) WITH CHECK (true);

-- Permissive: admins full access
CREATE POLICY "Admins can read all waitlist"
ON public.waitlist_submissions AS PERMISSIVE
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all waitlist"
ON public.waitlist_submissions AS PERMISSIVE
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete waitlist"
ON public.waitlist_submissions AS PERMISSIVE
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- FIX: contact_submissions RLS policies
-- ==========================================
DROP POLICY IF EXISTS "Admins can read contacts" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contacts" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can delete contacts" ON public.contact_submissions;
DROP POLICY IF EXISTS "Allow anonymous email check" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions AS PERMISSIVE
FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow anonymous email check"
ON public.contact_submissions AS PERMISSIVE
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admins can update contacts"
ON public.contact_submissions AS PERMISSIVE
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contacts"
ON public.contact_submissions AS PERMISSIVE
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- FIX: validation_submissions RLS policies
-- ==========================================
DROP POLICY IF EXISTS "Users can insert own validation" ON public.validation_submissions;
DROP POLICY IF EXISTS "Users can read own validation" ON public.validation_submissions;
DROP POLICY IF EXISTS "Users can update own validation" ON public.validation_submissions;
DROP POLICY IF EXISTS "Admins can read all validations" ON public.validation_submissions;
DROP POLICY IF EXISTS "Admins can delete validations" ON public.validation_submissions;
DROP POLICY IF EXISTS "Allow anonymous validation submission" ON public.validation_submissions;

CREATE POLICY "Allow anonymous validation submission"
ON public.validation_submissions AS PERMISSIVE
FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can read all validations"
ON public.validation_submissions AS PERMISSIVE
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete validations"
ON public.validation_submissions AS PERMISSIVE
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
