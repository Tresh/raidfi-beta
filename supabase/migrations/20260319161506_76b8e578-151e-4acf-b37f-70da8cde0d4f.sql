CREATE OR REPLACE FUNCTION public.get_leaderboard(_period text DEFAULT 'all')
RETURNS TABLE (
  email text,
  display_name text,
  total_xp integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
WITH contributions_filtered AS (
  SELECT
    lower(c.user_email) AS email,
    COALESCE(SUM(c.points_earned), 0)::integer AS contribution_xp
  FROM public.contributions c
  WHERE c.status = 'approved'
    AND (
      _period = 'all'
      OR (_period = 'day' AND c.created_at >= now() - interval '1 day')
      OR (_period = 'week' AND c.created_at >= now() - interval '7 days')
      OR (_period = 'month' AND c.created_at >= now() - interval '30 days')
    )
  GROUP BY lower(c.user_email)
),
all_emails AS (
  SELECT ls.email FROM public.leaderboard_scores ls
  UNION
  SELECT cf.email FROM contributions_filtered cf
)
SELECT
  ae.email,
  COALESCE(
    ls.display_name,
    regexp_replace(ae.email, '^(.{3}).*(@.*)$', '\1***\2')
  ) AS display_name,
  CASE
    WHEN _period = 'all' THEN COALESCE(ls.total_xp, 0)
    ELSE COALESCE(ls.waitlist_xp, 0) + COALESCE(ls.validation_xp, 0) + COALESCE(cf.contribution_xp, 0)
  END AS total_xp
FROM all_emails ae
LEFT JOIN public.leaderboard_scores ls ON ls.email = ae.email
LEFT JOIN contributions_filtered cf ON cf.email = ae.email
ORDER BY total_xp DESC, ae.email ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard(text) TO authenticated;