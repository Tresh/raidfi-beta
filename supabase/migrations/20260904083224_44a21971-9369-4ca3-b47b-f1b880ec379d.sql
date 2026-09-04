ALTER TABLE public.contributions
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_contributions_project_id ON public.contributions(project_id);

DROP VIEW IF EXISTS public.contributions_feed;

CREATE VIEW public.contributions_feed
WITH (security_invoker = false) AS
SELECT c.id,
    c.post_url,
    c.points_earned,
    c.created_at,
    c.status,
    c.content_type,
    c.manual_score,
    c.ai_score,
    c.ai_feedback,
    c.post_text,
    c.post_author,
    c.published_to_feed,
    c.engagement_count,
    c.user_id,
    p.referral_code,
    p.name AS author_name,
    p.x_username,
    c.project_id,
    pr.name AS project_name,
    pr.slug AS project_slug
   FROM contributions c
     LEFT JOIN profiles p ON p.user_id = c.user_id
     LEFT JOIN projects pr ON pr.id = c.project_id;

GRANT SELECT ON public.contributions_feed TO anon, authenticated;
GRANT ALL ON public.contributions_feed TO service_role;