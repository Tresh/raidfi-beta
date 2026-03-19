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

  computed_total := waitlist_points + validation_points + contribution_points;

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

CREATE OR REPLACE FUNCTION public.recalculate_all_leaderboard_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  participant_email text;
BEGIN
  FOR participant_email IN
    SELECT DISTINCT lower(email) FROM public.waitlist_submissions
    UNION
    SELECT DISTINCT lower(email) FROM public.validation_submissions
    UNION
    SELECT DISTINCT lower(user_email) FROM public.contributions
  LOOP
    PERFORM public.recalculate_leaderboard_score(participant_email);
  END LOOP;

  UPDATE public.profiles p
  SET total_points = 0
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.leaderboard_scores ls
    WHERE ls.email = lower(p.email)
  );
END;
$$;