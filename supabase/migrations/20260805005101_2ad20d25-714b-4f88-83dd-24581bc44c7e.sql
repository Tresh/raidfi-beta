ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS telegram_group_id text,
  ADD COLUMN IF NOT EXISTS telegram_bot_added boolean NOT NULL DEFAULT false;