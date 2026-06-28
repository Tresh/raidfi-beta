
CREATE TABLE public.telegram_links (
  telegram_user_id BIGINT PRIMARY KEY,
  telegram_chat_id BIGINT NOT NULL,
  telegram_username TEXT,
  first_name TEXT,
  email TEXT NOT NULL,
  dm_subscribed BOOLEAN NOT NULL DEFAULT true,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email)
);
CREATE INDEX idx_telegram_links_email ON public.telegram_links(email);
GRANT SELECT ON public.telegram_links TO authenticated;
GRANT ALL ON public.telegram_links TO service_role;
ALTER TABLE public.telegram_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their own link"
  ON public.telegram_links FOR SELECT TO authenticated
  USING (lower(email) = lower(coalesce(auth.email(),'')));
CREATE POLICY "Admins manage telegram links"
  ON public.telegram_links FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.telegram_link_codes (
  code TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.telegram_link_codes TO service_role;
ALTER TABLE public.telegram_link_codes ENABLE ROW LEVEL SECURITY;
-- No client access; only service role / edge functions

CREATE TABLE public.telegram_updates (
  update_id BIGINT PRIMARY KEY,
  chat_id BIGINT,
  user_id BIGINT,
  text TEXT,
  raw_update JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.telegram_updates TO service_role;
ALTER TABLE public.telegram_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read telegram updates"
  ON public.telegram_updates FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
