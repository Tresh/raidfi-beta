
CREATE OR REPLACE FUNCTION public.project_activity(_project_id uuid, _from timestamp with time zone DEFAULT (now() - '30 days'::interval), _to timestamp with time zone DEFAULT now(), _only_project boolean DEFAULT true, _limit integer DEFAULT 50, _offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, email text, display_name text, x_username text, referral_code text, post_url text, post_text text, status text, content_type text, media_type text, ai_generated boolean, score numeric, points_earned integer, created_at timestamp with time zone, is_project boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    COALESCE(NULLIF(trim(pr.x_username), ''), NULLIF(trim(pr.name), ''), regexp_replace(lower(c.user_email), '^(.{2}).*(@.*)$', '\1***\2')),
    pr.x_username, pr.referral_code,
    c.post_url, c.post_text, c.status, c.content_type, c.media_type,
    c.ai_generated, COALESCE(c.manual_score, c.ai_score)::numeric, c.points_earned,
    c.created_at,
    (c.project_id = _project_id) OR EXISTS (
      SELECT 1 FROM unnest(coalesce(terms, ARRAY[]::text[])) t
      WHERE length(t) >= 3
        AND (lower(coalesce(c.post_text,'')) LIKE '%'||t||'%' OR lower(c.post_url) LIKE '%'||t||'%')
    )
  FROM public.contributions c
  LEFT JOIN public.profiles pr ON lower(pr.email) = lower(c.user_email)
  WHERE c.created_at >= _from AND c.created_at <= _to
    AND (
      NOT _only_project
      OR c.project_id = _project_id
      OR EXISTS (
        SELECT 1 FROM unnest(coalesce(terms, ARRAY[]::text[])) t
        WHERE length(t) >= 3
          AND (lower(coalesce(c.post_text,'')) LIKE '%'||t||'%' OR lower(c.post_url) LIKE '%'||t||'%')
      )
    )
  ORDER BY c.created_at DESC
  LIMIT GREATEST(1, LEAST(_limit, 200)) OFFSET GREATEST(0, _offset);
END;
$function$;

CREATE OR REPLACE FUNCTION public.project_period_stats(_project_id uuid, _from timestamp with time zone, _to timestamp with time zone)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    'pending', COUNT(*) FILTER (WHERE status NOT IN ('approved','rejected')),
    'contributors', COUNT(DISTINCT lower(user_email)),
    'xp', COALESCE(SUM(points_earned) FILTER (WHERE status = 'approved'), 0),
    'avg_quality', ROUND(AVG(COALESCE(manual_score, ai_score)) FILTER (WHERE status = 'approved'), 1),
    'ai_generated', COUNT(*) FILTER (WHERE ai_generated)
  ) INTO result
  FROM public.contributions c
  WHERE c.created_at >= _from AND c.created_at <= _to
    AND (
      c.project_id = _project_id
      OR EXISTS (
        SELECT 1 FROM unnest(coalesce(terms, ARRAY[]::text[])) t
        WHERE length(t) >= 3
          AND (lower(coalesce(c.post_text,'')) LIKE '%'||t||'%' OR lower(c.post_url) LIKE '%'||t||'%')
      )
    );

  RETURN COALESCE(result, '{}'::jsonb);
END;
$function$;

CREATE OR REPLACE FUNCTION public.project_contributor_analytics(_project_id uuid, _from timestamp with time zone DEFAULT (now() - '90 days'::interval), _to timestamp with time zone DEFAULT now())
 RETURNS TABLE(email text, display_name text, x_username text, referral_code text, total_xp integer, contributions integer, accepted integer, rejected integer, pending integer, acceptance_rate numeric, avg_quality numeric, max_quality numeric, xp_earned integer, first_contribution timestamp with time zone, last_contribution timestamp with time zone, active_days integer, active_weeks integer, project_contributions integer, project_accepted integer, project_xp integer, project_last timestamp with time zone, ai_generated_count integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      (c.project_id = _project_id) OR EXISTS (
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
    COALESCE(NULLIF(trim(pr.x_username), ''), NULLIF(trim(pr.name), ''), ls.display_name,
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
$function$;
