-- Allow anonymous update of waitlist points (for validation bonus)
CREATE POLICY "Allow anonymous waitlist points update"
ON public.waitlist_submissions
FOR UPDATE
USING (true)
WITH CHECK (true);