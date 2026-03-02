
-- Fix waitlist_submissions policies
DROP POLICY IF EXISTS "Allow anonymous waitlist signup" ON public.waitlist_submissions;
DROP POLICY IF EXISTS "Allow anonymous waitlist points update" ON public.waitlist_submissions;
DROP POLICY IF EXISTS "Admins can read all waitlist" ON public.waitlist_submissions;
DROP POLICY IF EXISTS "Admins can update all waitlist" ON public.waitlist_submissions;
DROP POLICY IF EXISTS "Admins can delete waitlist" ON public.waitlist_submissions;

CREATE POLICY "Anyone can submit to waitlist" ON public.waitlist_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update waitlist points" ON public.waitlist_submissions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can read waitlist" ON public.waitlist_submissions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete waitlist" ON public.waitlist_submissions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix contact_submissions policies
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Allow anonymous email check" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contacts" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can delete contacts" ON public.contact_submissions;

CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read contacts" ON public.contact_submissions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can update contacts" ON public.contact_submissions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete contacts" ON public.contact_submissions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix validation_submissions policies
DROP POLICY IF EXISTS "Allow anonymous validation submission" ON public.validation_submissions;
DROP POLICY IF EXISTS "Admins can read all validations" ON public.validation_submissions;
DROP POLICY IF EXISTS "Admins can delete validations" ON public.validation_submissions;

CREATE POLICY "Anyone can submit validation" ON public.validation_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read validations" ON public.validation_submissions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete validations" ON public.validation_submissions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
