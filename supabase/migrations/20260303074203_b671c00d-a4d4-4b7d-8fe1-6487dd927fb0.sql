
-- Drop ALL existing policies on all tables
DROP POLICY IF EXISTS "Anyone can submit to waitlist" ON public.waitlist_submissions;
DROP POLICY IF EXISTS "Anyone can update waitlist points" ON public.waitlist_submissions;
DROP POLICY IF EXISTS "Admins can read waitlist" ON public.waitlist_submissions;
DROP POLICY IF EXISTS "Admins can delete waitlist" ON public.waitlist_submissions;

DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can read contacts" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contacts" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can delete contacts" ON public.contact_submissions;

DROP POLICY IF EXISTS "Anyone can submit validation" ON public.validation_submissions;
DROP POLICY IF EXISTS "Admins can read validations" ON public.validation_submissions;
DROP POLICY IF EXISTS "Admins can delete validations" ON public.validation_submissions;

-- waitlist_submissions: PERMISSIVE policies
CREATE POLICY "anon_insert_waitlist" ON public.waitlist_submissions AS PERMISSIVE FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_waitlist" ON public.waitlist_submissions AS PERMISSIVE FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_select_waitlist" ON public.waitlist_submissions AS PERMISSIVE FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admin_delete_waitlist" ON public.waitlist_submissions AS PERMISSIVE FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- contact_submissions: PERMISSIVE policies
CREATE POLICY "anon_insert_contact" ON public.contact_submissions AS PERMISSIVE FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_select_contact" ON public.contact_submissions AS PERMISSIVE FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_update_contact" ON public.contact_submissions AS PERMISSIVE FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admin_delete_contact" ON public.contact_submissions AS PERMISSIVE FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- validation_submissions: PERMISSIVE policies
CREATE POLICY "anon_insert_validation" ON public.validation_submissions AS PERMISSIVE FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_select_validation" ON public.validation_submissions AS PERMISSIVE FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_delete_validation" ON public.validation_submissions AS PERMISSIVE FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
