
-- Backfill old posts so they show in the live feed
UPDATE public.contributions
SET published_to_feed = true
WHERE published_to_feed = false AND status <> 'rejected';

-- Track whether a task has already been announced on Telegram
ALTER TABLE public.contribute_tasks
  ADD COLUMN IF NOT EXISTS telegram_notified boolean NOT NULL DEFAULT false;

-- Improved leaderboard RPC: period-aware with total + overall rank
DROP FUNCTION IF EXISTS public.get_leaderboard(text);

CREATE OR REPLACE FUNCTION public.get_leaderboard(_period text DEFAULT 'all')
RETURNS TABLE(
  email text,
  display_name text,
  period_xp integer,
  total_xp integer,
  overall_rank integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
WITH ranked AS (
  SELECT
    ls.email,
    ls.display_name,
    ls.total_xp,
    ROW_NUMBER() OVER (ORDER BY ls.total_xp DESC, ls.email ASC)::int AS overall_rank
  FROM public.leaderboard_scores ls
),
period_contrib AS (
  SELECT
    lower(c.user_email) AS email,
    COALESCE(SUM(c.points_earned), 0)::int AS period_xp
  FROM public.contributions c
  WHERE c.status = 'approved'
    AND (
      _period = 'day'   AND c.created_at >= now() - interval '1 day'  OR
      _period = 'week'  AND c.created_at >= now() - interval '7 days' OR
      _period = 'month' AND c.created_at >= now() - interval '30 days'
    )
  GROUP BY lower(c.user_email)
)
SELECT
  r.email,
  r.display_name,
  CASE WHEN _period = 'all' THEN r.total_xp ELSE COALESCE(pc.period_xp, 0) END AS period_xp,
  r.total_xp,
  r.overall_rank
FROM ranked r
LEFT JOIN period_contrib pc ON pc.email = r.email
WHERE _period = 'all' OR COALESCE(pc.period_xp, 0) > 0
ORDER BY period_xp DESC, r.email ASC;
$$;
