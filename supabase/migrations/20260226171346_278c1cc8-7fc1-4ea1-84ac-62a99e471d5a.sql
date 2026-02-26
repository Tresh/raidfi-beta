-- Allow anonymous inserts to waitlist (no auth required)
CREATE POLICY "Allow anonymous waitlist signup"
ON public.waitlist_submissions
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);