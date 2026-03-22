
-- Activity log table for tracking all XP events
CREATE TABLE IF NOT EXISTS public.user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  activity_type text NOT NULL, -- 'waitlist', 'validation', 'contribution', 'task', 'admin_grant', 'referral'
  description text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Users can read their own activities
CREATE POLICY "users_read_own_activities"
ON public.user_activities
FOR SELECT
TO authenticated
USING (lower(user_email) = lower(auth.email()));

-- Admins can do everything
CREATE POLICY "admin_manage_activities"
ON public.user_activities
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow anon/authenticated insert (for triggers/system inserts)
CREATE POLICY "system_insert_activities"
ON public.user_activities
FOR INSERT
WITH CHECK (true);

-- Backfill activities from existing data

-- Waitlist activities
INSERT INTO public.user_activities (user_email, activity_type, description, points, created_at)
SELECT email, 'waitlist', 'Joined the waitlist', points, created_at
FROM public.waitlist_submissions
ON CONFLICT DO NOTHING;

-- Validation activities  
INSERT INTO public.user_activities (user_email, activity_type, description, points, created_at)
SELECT email, 'validation', 'Completed validation form', points_earned, created_at
FROM public.validation_submissions
ON CONFLICT DO NOTHING;

-- Contribution activities (approved only)
INSERT INTO public.user_activities (user_email, activity_type, description, points, created_at)
SELECT user_email, 'contribution', 'Post approved: ' || post_url, points_earned, created_at
FROM public.contributions
WHERE status = 'approved'
ON CONFLICT DO NOTHING;

-- Trigger function to log activities on contribution approval
CREATE OR REPLACE FUNCTION public.log_contribution_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'approved' AND OLD.status <> 'approved' THEN
    INSERT INTO public.user_activities (user_email, activity_type, description, points, created_at)
    VALUES (NEW.user_email, 'contribution', 'Post approved', NEW.points_earned, now());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_contribution_activity ON public.contributions;
CREATE TRIGGER trg_log_contribution_activity
AFTER UPDATE ON public.contributions
FOR EACH ROW
EXECUTE FUNCTION public.log_contribution_activity();

-- Trigger for admin point grants (logged via insert to user_activities with type 'admin_grant')
-- The admin page will insert directly into user_activities

-- Update recalculate function to include admin grants
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
  admin_points integer := 0;
  task_points integer := 0;
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

  -- Admin-granted points
  SELECT COALESCE(SUM(points), 0)
  INTO admin_points
  FROM public.user_activities
  WHERE lower(user_email) = normalized_email
    AND activity_type = 'admin_grant';

  -- Contribute task points
  SELECT COALESCE(SUM(ct.points), 0)
  INTO task_points
  FROM public.contribute_task_completions ctc
  JOIN public.contribute_tasks ct ON ct.id = ctc.task_id
  JOIN public.profiles p ON p.user_id = ctc.user_id
  WHERE lower(p.email) = normalized_email;

  computed_total := GREATEST(waitlist_points, validation_points) + contribution_points + admin_points + task_points;

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
    contribution_points + admin_points + task_points,
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

-- Trigger to recalculate leaderboard when admin grants points
CREATE OR REPLACE FUNCTION public.handle_activity_leaderboard_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.activity_type = 'admin_grant' THEN
    PERFORM public.recalculate_leaderboard_score(NEW.user_email);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_activity_leaderboard_sync ON public.user_activities;
CREATE TRIGGER trg_activity_leaderboard_sync
AFTER INSERT ON public.user_activities
FOR EACH ROW
EXECUTE FUNCTION public.handle_activity_leaderboard_sync();

-- Enable realtime for user_activities
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activities;
