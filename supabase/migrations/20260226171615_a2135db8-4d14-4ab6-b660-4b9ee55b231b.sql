-- Allow anonymous inserts to validation_submissions (linked by email, no auth)
CREATE POLICY "Allow anonymous validation submission"
ON public.validation_submissions
FOR INSERT
TO anon
WITH CHECK (true);

-- Make user_id nullable for anonymous submissions
ALTER TABLE public.validation_submissions ALTER COLUMN user_id DROP NOT NULL;