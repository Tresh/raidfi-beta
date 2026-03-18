-- Add status column to contributions
ALTER TABLE public.contributions 
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Update existing contributions to approved
UPDATE public.contributions SET status = 'approved' WHERE status = 'pending';