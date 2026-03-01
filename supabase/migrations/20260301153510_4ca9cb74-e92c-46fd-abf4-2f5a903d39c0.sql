-- Allow anonymous email duplicate check on contact_submissions
CREATE POLICY "Allow anonymous email check"
ON public.contact_submissions
FOR SELECT
USING (true);