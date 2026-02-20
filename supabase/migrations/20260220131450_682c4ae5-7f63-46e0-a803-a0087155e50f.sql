
-- Validation submissions table to store form data
CREATE TABLE public.validation_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('raider', 'project')),
  name TEXT NOT NULL,
  twitter_handle TEXT,
  telegram_handle TEXT,
  why_interested TEXT,
  experience TEXT,
  project_name TEXT,
  project_description TEXT,
  project_website TEXT,
  expected_budget TEXT,
  points_earned INTEGER NOT NULL DEFAULT 200,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.validation_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own validation"
  ON public.validation_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own validation"
  ON public.validation_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own validation"
  ON public.validation_submissions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
