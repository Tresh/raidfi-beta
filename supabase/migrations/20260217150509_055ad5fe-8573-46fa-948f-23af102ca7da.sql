
-- Waitlist submissions table
CREATE TABLE public.waitlist_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  points INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.waitlist_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (signup flow)
CREATE POLICY "Allow insert for authenticated users"
  ON public.waitlist_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own submission
CREATE POLICY "Users can read own submission"
  ON public.waitlist_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own submission
CREATE POLICY "Users can update own submission"
  ON public.waitlist_submissions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
