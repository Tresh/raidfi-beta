
ALTER TABLE public.validation_submissions ADD COLUMN IF NOT EXISTS form_responses jsonb DEFAULT '{}'::jsonb;
