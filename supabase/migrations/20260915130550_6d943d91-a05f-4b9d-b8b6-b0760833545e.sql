CREATE TABLE public.telegram_pending_submissions (
  token text PRIMARY KEY,
  telegram_user_id bigint NOT NULL,
  chat_id bigint NOT NULL,
  message_id bigint,
  post_url text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '30 minutes'
);
GRANT ALL ON public.telegram_pending_submissions TO service_role;
ALTER TABLE public.telegram_pending_submissions ENABLE ROW LEVEL SECURITY;