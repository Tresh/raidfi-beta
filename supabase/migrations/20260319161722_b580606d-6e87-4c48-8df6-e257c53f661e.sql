CREATE OR REPLACE FUNCTION public.recalculate_leaderboard_score(_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_email text;
  waitlist_points integer := 0;
  validation_points integer := 0;
  contribution_points integer := 0;
  profile_name text;
  computed_display_name text;
  computed_total integer := 0;
BEGIN
  normalized_email := lower(trim(_email));

  IF normalized_email IS NULL OR normalized_email = '' THEN
    RETURN;
  END IF;

  SELECT COALESCE(MAX(points), 0)
  INTO waitlist_points
  FROM public.waitlist_submissions
  WHERE lower(email) = normalized_email;

  SELECT COALESCE(MAX(points_earned), 0)
  INTO validation_points
  FROM public.validation_submissions
  WHERE lower(email) = normalized_email;

  SELECT COALESCE(SUM(points_earned), 0)
  INTO contribution_points
  FROM public.contributions
  WHERE lower(user_email) = normalized_email
    AND status = 'approved';

  -- Base XP should not double count waitlist + validation.
  -- We take the stronger of the two milestones, then add contribution XP.
  computed_total := GREATEST(waitlist_points, validation_points) + contribution_points;

  SELECT p.name
  INTO profile_name
  FROM public.profiles p
  WHERE lower(p.email) = normalized_email
  ORDER BY p.created_at ASC
  LIMIT 1;

  computed_display_name := COALESCE(
    NULLIF(trim(profile_name), ''),
    regexp_replace(normalized_email, '^(.{3}).*(@.*)$', '\1***\2')
  );

  IF computed_total = 0 THEN
    DELETE FROM public.leaderboard_scores WHERE email = normalized_email;
    UPDATE public.profiles
    SET total_points = 0
    WHERE lower(email) = normalized_email;
    RETURN;
  END IF;

  INSERT INTO public.leaderboard_scores (
    email,
    display_name,
    waitlist_xp,
    validation_xp,
    contribution_xp,
    total_xp,
    updated_at
  )
  VALUES (
    normalized_email,
    computed_display_name,
    waitlist_points,
    validation_points,
    contribution_points,
    computed_total,
    now()
  )
  ON CONFLICT (email) DO UPDATE
  SET
    display_name = EXCLUDED.display_name,
    waitlist_xp = EXCLUDED.waitlist_xp,
    validation_xp = EXCLUDED.validation_xp,
    contribution_xp = EXCLUDED.contribution_xp,
    total_xp = EXCLUDED.total_xp,
    updated_at = now();

  UPDATE public.profiles
  SET total_points = computed_total
  WHERE lower(email) = normalized_email;
END;
$$;

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
    ELSE GREATEST(COALESCE(ls.waitlist_xp, 0), COALESCE(ls.validation_xp, 0)) + COALESCE(cf.contribution_xp, 0)
  END AS total_xp
FROM all_emails ae
LEFT JOIN public.leaderboard_scores ls ON ls.email = ae.email
LEFT JOIN contributions_filtered cf ON cf.email = ae.email
ORDER BY total_xp DESC, ae.email ASC;
$$;

SELECT public.recalculate_all_leaderboard_scores();