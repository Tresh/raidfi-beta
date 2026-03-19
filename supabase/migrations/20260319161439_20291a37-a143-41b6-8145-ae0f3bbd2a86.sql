CREATE TABLE IF NOT EXISTS public.leaderboard_scores (
  email text PRIMARY KEY,
  display_name text NOT NULL,
  waitlist_xp integer NOT NULL DEFAULT 0,
  validation_xp integer NOT NULL DEFAULT 0,
  contribution_xp integer NOT NULL DEFAULT 0,
  total_xp integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.leaderboard_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_leaderboard_scores" ON public.leaderboard_scores;
CREATE POLICY "authenticated_read_leaderboard_scores"
ON public.leaderboard_scores
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "admin_manage_leaderboard_scores" ON public.leaderboard_scores;
CREATE POLICY "admin_manage_leaderboard_scores"
ON public.leaderboard_scores
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX IF NOT EXISTS idx_waitlist_submissions_email_lower
ON public.waitlist_submissions (lower(email));

CREATE INDEX IF NOT EXISTS idx_validation_submissions_email_lower
ON public.validation_submissions (lower(email));

CREATE INDEX IF NOT EXISTS idx_contributions_user_email_status
ON public.contributions (lower(user_email), status);