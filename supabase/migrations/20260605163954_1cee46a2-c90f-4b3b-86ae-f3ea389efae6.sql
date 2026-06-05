
-- 1. Extend contributions
ALTER TABLE public.contributions
  ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'post',
  ADD COLUMN IF NOT EXISTS manual_score integer,
  ADD COLUMN IF NOT EXISTS published_to_feed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS post_text text,
  ADD COLUMN IF NOT EXISTS post_author text,
  ADD COLUMN IF NOT EXISTS post_fetched_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_notes text;

CREATE INDEX IF NOT EXISTS idx_contributions_feed ON public.contributions(published_to_feed, status, created_at DESC);

-- 2. Extend contribute_tasks
ALTER TABLE public.contribute_tasks
  ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_link_submission boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS submission_label text,
  ADD COLUMN IF NOT EXISTS submission_placeholder text,
  ADD COLUMN IF NOT EXISTS action_types text[] NOT NULL DEFAULT ARRAY[]::text[];

-- 3. Extend contribute_task_completions
ALTER TABLE public.contribute_task_completions
  ADD COLUMN IF NOT EXISTS submission_link text;

-- 4. Admin-managed content types (for contributions)
CREATE TABLE IF NOT EXISTS public.content_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL UNIQUE,
  label text NOT NULL,
  default_points integer NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.content_types TO anon, authenticated;
GRANT ALL ON public.content_types TO service_role;
ALTER TABLE public.content_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_content_types" ON public.content_types FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_manage_content_types" ON public.content_types FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_permission(auth.uid(), 'contributions'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_permission(auth.uid(), 'contributions'));

INSERT INTO public.content_types (value, label, default_points, sort_order) VALUES
  ('post', 'Post', 10, 1),
  ('quote', 'Quote', 8, 2),
  ('thread', 'Thread', 20, 3),
  ('space', 'Space', 30, 4)
ON CONFLICT (value) DO NOTHING;

-- 5. Admin-managed task action types (comment/repost/like/quote/...)
CREATE TABLE IF NOT EXISTS public.task_action_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL UNIQUE,
  label text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.task_action_types TO anon, authenticated;
GRANT ALL ON public.task_action_types TO service_role;
ALTER TABLE public.task_action_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_task_action_types" ON public.task_action_types FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_manage_task_action_types" ON public.task_action_types FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_permission(auth.uid(), 'contribute_tasks'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_permission(auth.uid(), 'contribute_tasks'));

INSERT INTO public.task_action_types (value, label, sort_order) VALUES
  ('like', 'Like', 1),
  ('comment', 'Comment', 2),
  ('repost', 'Repost', 3),
  ('quote', 'Quote', 4),
  ('follow', 'Follow', 5),
  ('bookmark', 'Bookmark', 6)
ON CONFLICT (value) DO NOTHING;

-- 6. Admin settings (singleton)
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id text PRIMARY KEY DEFAULT 'global',
  auto_publish_contributions boolean NOT NULL DEFAULT false,
  telegram_enabled boolean NOT NULL DEFAULT false,
  telegram_chat_id text,
  telegram_notify_feed boolean NOT NULL DEFAULT true,
  telegram_notify_tasks boolean NOT NULL DEFAULT true,
  scoring_delay_hours integer NOT NULL DEFAULT 24,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_settings TO anon, authenticated;
GRANT ALL ON public.admin_settings TO service_role;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_admin_settings" ON public.admin_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_manage_admin_settings" ON public.admin_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.admin_settings (id) VALUES ('global') ON CONFLICT (id) DO NOTHING;

-- 7. Trigger: auto-publish new contributions when global setting on
CREATE OR REPLACE FUNCTION public.handle_contribution_autopublish()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  auto_pub boolean;
BEGIN
  SELECT auto_publish_contributions INTO auto_pub FROM public.admin_settings WHERE id = 'global';
  IF auto_pub IS TRUE THEN
    NEW.published_to_feed := true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contribution_autopublish ON public.contributions;
CREATE TRIGGER trg_contribution_autopublish
BEFORE INSERT ON public.contributions
FOR EACH ROW EXECUTE FUNCTION public.handle_contribution_autopublish();

-- 8. RLS: allow public to read contributions that are published_to_feed (already public_read_contributions exists which is true; keep it but useful for clarity)
-- (Existing public_read_contributions returns all - frontend filters. We'll keep as-is.)

-- 9. Profile tags
CREATE TABLE IF NOT EXISTS public.profile_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  tag text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_email, tag)
);
GRANT SELECT ON public.profile_tags TO anon, authenticated;
GRANT ALL ON public.profile_tags TO service_role;
ALTER TABLE public.profile_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_profile_tags" ON public.profile_tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_manage_profile_tags" ON public.profile_tags FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_permission(auth.uid(), 'contributions'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_permission(auth.uid(), 'contributions'));
