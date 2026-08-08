-- 1. Feed view: expose x_username
CREATE OR REPLACE VIEW public.contributions_feed AS
SELECT c.id, c.post_url, c.points_earned, c.created_at, c.status, c.content_type,
       c.manual_score, c.ai_score, c.ai_feedback, c.post_text, c.post_author,
       c.published_to_feed, c.engagement_count, c.user_id,
       p.referral_code, p.name AS author_name, p.x_username
FROM public.contributions c
LEFT JOIN public.profiles p ON p.user_id = c.user_id;

-- 2. Project X identity
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS x_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS x_verified_at timestamptz;

-- 3. Helper: project admin check
CREATE OR REPLACE FUNCTION public.is_project_admin(_user_id uuid, _project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE user_id = _user_id AND project_id = _project_id
      AND member_role IN ('project_admin','owner')
  );
$$;

-- 4. Project admins manage their own members
DROP POLICY IF EXISTS project_members_project_admin_write ON public.project_members;
CREATE POLICY project_members_project_admin_write ON public.project_members
  FOR ALL TO authenticated
  USING (public.is_project_admin(auth.uid(), project_id))
  WITH CHECK (public.is_project_admin(auth.uid(), project_id));

DROP POLICY IF EXISTS projects_member_update ON public.projects;
CREATE POLICY projects_member_update ON public.projects
  FOR UPDATE TO authenticated
  USING (public.is_project_admin(auth.uid(), id))
  WITH CHECK (public.is_project_admin(auth.uid(), id));

-- 5. Saved searches / views
CREATE TABLE IF NOT EXISTS public.project_saved_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'search',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_saved_views TO authenticated;
GRANT ALL ON public.project_saved_views TO service_role;
ALTER TABLE public.project_saved_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS psv_member_all ON public.project_saved_views;
CREATE POLICY psv_member_all ON public.project_saved_views
  FOR ALL TO authenticated
  USING (public.is_project_member(auth.uid(), project_id) OR public.is_staff(auth.uid()))
  WITH CHECK (public.is_project_member(auth.uid(), project_id) OR public.is_staff(auth.uid()));
DROP TRIGGER IF EXISTS psv_updated_at ON public.project_saved_views;
CREATE TRIGGER psv_updated_at BEFORE UPDATE ON public.project_saved_views
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Contributor lists
CREATE TABLE IF NOT EXISTS public.project_contributor_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  note text,
  emails text[] NOT NULL DEFAULT '{}',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_contributor_lists TO authenticated;
GRANT ALL ON public.project_contributor_lists TO service_role;
ALTER TABLE public.project_contributor_lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pcl_member_all ON public.project_contributor_lists;
CREATE POLICY pcl_member_all ON public.project_contributor_lists
  FOR ALL TO authenticated
  USING (public.is_project_member(auth.uid(), project_id) OR public.is_staff(auth.uid()))
  WITH CHECK (public.is_project_member(auth.uid(), project_id) OR public.is_staff(auth.uid()));
DROP TRIGGER IF EXISTS pcl_updated_at ON public.project_contributor_lists;
CREATE TRIGGER pcl_updated_at BEFORE UPDATE ON public.project_contributor_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. AI provider connection (project brings its own key)
CREATE TABLE IF NOT EXISTS public.project_ai_config (
  project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'openai',
  model text NOT NULL DEFAULT 'gpt-4o-mini',
  api_key text,
  key_hint text,
  consent_at timestamptz,
  consent_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.project_ai_config TO service_role;
ALTER TABLE public.project_ai_config ENABLE ROW LEVEL SECURITY;
-- No direct client access: reads/writes go through edge functions only.

CREATE OR REPLACE VIEW public.project_ai_config_public AS
SELECT project_id, provider, model, key_hint, consent_at,
       (api_key IS NOT NULL) AS connected, updated_at
FROM public.project_ai_config;
GRANT SELECT ON public.project_ai_config_public TO authenticated;

-- 8. Project-scoped contributor analytics
CREATE OR REPLACE FUNCTION public.project_contributor_analytics(
  _project_id uuid,
  _from timestamptz DEFAULT (now() - interval '90 days'),
  _to timestamptz DEFAULT now()
)
RETURNS TABLE(
  email text, display_name text, x_username text, referral_code text,
  total_xp integer, contributions integer, accepted integer, rejected integer,
  pending integer, acceptance_rate numeric, avg_quality numeric, max_quality numeric,
  xp_earned integer, first_contribution timestamptz, last_contribution timestamptz,
  active_days integer, active_weeks integer,
  project_contributions integer, project_accepted integer, project_xp integer,
  project_last timestamptz, ai_generated_count integer
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE terms text[];
BEGIN
  IF NOT (public.is_project_member(auth.uid(), _project_id) OR public.is_staff(auth.uid())) THEN
    RAISE EXCEPTION 'Not authorized for this project';
  END IF;

  SELECT array_remove(ARRAY[
    lower(nullif(trim(p.name), '')),
    lower(nullif(ltrim(trim(coalesce(p.x_handle,'')), '@'), '')),
    lower(nullif(trim(coalesce(p.slug,'')), ''))
  ], NULL) INTO terms
  FROM public.projects p WHERE p.id = _project_id;

  RETURN QUERY
  WITH base AS (
    SELECT lower(c.user_email) AS em, c.*,
      EXISTS (
        SELECT 1 FROM unnest(coalesce(terms, ARRAY[]::text[])) t
        WHERE length(t) >= 3
          AND (lower(coalesce(c.post_text,'')) LIKE '%'||t||'%'
            OR lower(c.post_url) LIKE '%'||t||'%')
      ) AS is_project
    FROM public.contributions c
    WHERE c.created_at >= _from AND c.created_at <= _to
  )
  SELECT
    b.em,
    COALESCE(NULLIF(trim(pr.name), ''), ls.display_name,
             regexp_replace(b.em, '^(.{2}).*(@.*)$', '\1***\2')) AS display_name,
    pr.x_username,
    pr.referral_code,
    COALESCE(ls.total_xp, 0)::int,
    COUNT(*)::int,
    COUNT(*) FILTER (WHERE b.status = 'approved')::int,
    COUNT(*) FILTER (WHERE b.status = 'rejected')::int,
    COUNT(*) FILTER (WHERE b.status NOT IN ('approved','rejected'))::int,
    ROUND(COUNT(*) FILTER (WHERE b.status = 'approved')::numeric / NULLIF(COUNT(*), 0) * 100, 1),
    ROUND(AVG(COALESCE(b.manual_score, b.ai_score)) FILTER (WHERE b.status = 'approved'), 1),
    MAX(COALESCE(b.manual_score, b.ai_score))::numeric,
    COALESCE(SUM(b.points_earned) FILTER (WHERE b.status = 'approved'), 0)::int,
    MIN(b.created_at), MAX(b.created_at),
    COUNT(DISTINCT date_trunc('day', b.created_at))::int,
    COUNT(DISTINCT date_trunc('week', b.created_at))::int,
    COUNT(*) FILTER (WHERE b.is_project)::int,
    COUNT(*) FILTER (WHERE b.is_project AND b.status = 'approved')::int,
    COALESCE(SUM(b.points_earned) FILTER (WHERE b.is_project AND b.status = 'approved'), 0)::int,
    MAX(b.created_at) FILTER (WHERE b.is_project),
    COUNT(*) FILTER (WHERE b.ai_generated)::int
  FROM base b
  LEFT JOIN public.profiles pr ON lower(pr.email) = b.em
  LEFT JOIN public.leaderboard_scores ls ON ls.email = b.em
  GROUP BY b.em, pr.name, pr.x_username, pr.referral_code, ls.display_name, ls.total_xp;
END;
$$;
GRANT EXECUTE ON FUNCTION public.project_contributor_analytics(uuid, timestamptz, timestamptz) TO authenticated;

-- 9. Project-scoped activity feed
CREATE OR REPLACE FUNCTION public.project_activity(
  _project_id uuid,
  _from timestamptz DEFAULT (now() - interval '30 days'),
  _to timestamptz DEFAULT now(),
  _only_project boolean DEFAULT true,
  _limit integer DEFAULT 50,
  _offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid, email text, display_name text, x_username text, referral_code text,
  post_url text, post_text text, status text, content_type text, media_type text,
  ai_generated boolean, score numeric, points_earned integer,
  created_at timestamptz, is_project boolean
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE terms text[];
BEGIN
  IF NOT (public.is_project_member(auth.uid(), _project_id) OR public.is_staff(auth.uid())) THEN
    RAISE EXCEPTION 'Not authorized for this project';
  END IF;

  SELECT array_remove(ARRAY[
    lower(nullif(trim(p.name), '')),
    lower(nullif(ltrim(trim(coalesce(p.x_handle,'')), '@'), '')),
    lower(nullif(trim(coalesce(p.slug,'')), ''))
  ], NULL) INTO terms
  FROM public.projects p WHERE p.id = _project_id;

  RETURN QUERY
  SELECT c.id, lower(c.user_email),
    COALESCE(NULLIF(trim(pr.name), ''), regexp_replace(lower(c.user_email), '^(.{2}).*(@.*)$', '\1***\2')),
    pr.x_username, pr.referral_code,
    c.post_url, c.post_text, c.status, c.content_type, c.media_type,
    c.ai_generated, COALESCE(c.manual_score, c.ai_score)::numeric, c.points_earned,
    c.created_at,
    EXISTS (
      SELECT 1 FROM unnest(coalesce(terms, ARRAY[]::text[])) t
      WHERE length(t) >= 3
        AND (lower(coalesce(c.post_text,'')) LIKE '%'||t||'%' OR lower(c.post_url) LIKE '%'||t||'%')
    )
  FROM public.contributions c
  LEFT JOIN public.profiles pr ON lower(pr.email) = lower(c.user_email)
  WHERE c.created_at >= _from AND c.created_at <= _to
    AND (
      NOT _only_project
      OR EXISTS (
        SELECT 1 FROM unnest(coalesce(terms, ARRAY[]::text[])) t
        WHERE length(t) >= 3
          AND (lower(coalesce(c.post_text,'')) LIKE '%'||t||'%' OR lower(c.post_url) LIKE '%'||t||'%')
      )
    )
  ORDER BY c.created_at DESC
  LIMIT GREATEST(1, LEAST(_limit, 200)) OFFSET GREATEST(0, _offset);
END;
$$;
GRANT EXECUTE ON FUNCTION public.project_activity(uuid, timestamptz, timestamptz, boolean, integer, integer) TO authenticated;

-- 10. Period summary for comparisons
CREATE OR REPLACE FUNCTION public.project_period_stats(
  _project_id uuid, _from timestamptz, _to timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE terms text[]; result jsonb;
BEGIN
  IF NOT (public.is_project_member(auth.uid(), _project_id) OR public.is_staff(auth.uid())) THEN
    RAISE EXCEPTION 'Not authorized for this project';
  END IF;

  SELECT array_remove(ARRAY[
    lower(nullif(trim(p.name), '')),
    lower(nullif(ltrim(trim(coalesce(p.x_handle,'')), '@'), '')),
    lower(nullif(trim(coalesce(p.slug,'')), ''))
  ], NULL) INTO terms
  FROM public.projects p WHERE p.id = _project_id;

  SELECT jsonb_build_object(
    'contributions', COUNT(*),
    'accepted', COUNT(*) FILTER (WHERE status = 'approved'),
    'rejected', COUNT(*) FILTER (WHERE status = 'rejected'),
    'contributors', COUNT(DISTINCT lower(user_email)),
    'xp', COALESCE(SUM(points_earned) FILTER (WHERE status = 'approved'), 0),
    'avg_quality', ROUND(AVG(COALESCE(manual_score, ai_score)) FILTER (WHERE status = 'approved'), 1),
    'ai_generated', COUNT(*) FILTER (WHERE ai_generated)
  ) INTO result
  FROM public.contributions c
  WHERE c.created_at >= _from AND c.created_at <= _to
    AND EXISTS (
      SELECT 1 FROM unnest(coalesce(terms, ARRAY[]::text[])) t
      WHERE length(t) >= 3
        AND (lower(coalesce(c.post_text,'')) LIKE '%'||t||'%' OR lower(c.post_url) LIKE '%'||t||'%')
    );

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;
GRANT EXECUTE ON FUNCTION public.project_period_stats(uuid, timestamptz, timestamptz) TO authenticated;