
CREATE POLICY project_members_read_project_contributions
ON public.contributions FOR SELECT TO authenticated
USING (project_id IS NOT NULL AND public.is_project_member(auth.uid(), project_id));

CREATE OR REPLACE FUNCTION public.project_period_stats(_project_id uuid, _from timestamp with time zone, _to timestamp with time zone)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE terms text[]; result jsonb; eco integer;
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

  SELECT COUNT(*) INTO eco FROM public.contributions c
  WHERE c.created_at >= _from AND c.created_at <= _to;

  SELECT jsonb_build_object(
    'contributions', COUNT(*),
    'accepted', COUNT(*) FILTER (WHERE status = 'approved'),
    'rejected', COUNT(*) FILTER (WHERE status = 'rejected'),
    'pending', COUNT(*) FILTER (WHERE status NOT IN ('approved','rejected')),
    'contributors', COUNT(DISTINCT lower(user_email)),
    'xp', COALESCE(SUM(points_earned) FILTER (WHERE status = 'approved'), 0),
    'avg_quality', ROUND(AVG(COALESCE(manual_score, ai_score)) FILTER (WHERE status = 'approved'), 1),
    'ai_generated', COUNT(*) FILTER (WHERE ai_generated),
    'ecosystem_contributions', eco
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
