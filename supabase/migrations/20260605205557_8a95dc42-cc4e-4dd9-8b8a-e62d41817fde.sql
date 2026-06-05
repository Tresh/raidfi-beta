
-- ============= admin_settings: lock down, expose via RPC =============
DROP POLICY IF EXISTS public_read_admin_settings ON public.admin_settings;
REVOKE SELECT ON public.admin_settings FROM anon;

CREATE OR REPLACE FUNCTION public.get_scoring_delay_hours()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT scoring_delay_hours FROM public.admin_settings WHERE id = 'global'), 24);
$$;
GRANT EXECUTE ON FUNCTION public.get_scoring_delay_hours() TO anon, authenticated;

-- ============= contact_submissions: lock reads to admin, add email-exists RPC =============
DROP POLICY IF EXISTS anon_select_contact ON public.contact_submissions;
REVOKE SELECT ON public.contact_submissions FROM anon;
CREATE POLICY admin_select_contact ON public.contact_submissions
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.contact_email_exists(_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.contact_submissions WHERE email = _email);
$$;
GRANT EXECUTE ON FUNCTION public.contact_email_exists(text) TO anon, authenticated;

-- ============= contribution_engagements: lock reads =============
DROP POLICY IF EXISTS public_read_engagements ON public.contribution_engagements;
REVOKE SELECT ON public.contribution_engagements FROM anon;
CREATE POLICY auth_read_own_engagements ON public.contribution_engagements
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- ============= contributions: stop exposing user_email; expose via view =============
DROP POLICY IF EXISTS public_read_contributions ON public.contributions;
REVOKE SELECT ON public.contributions FROM anon;
-- authenticated still has SELECT grant, but RLS only allows owner/admin/moderator (existing policies)
CREATE POLICY auth_read_own_contributions ON public.contributions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Backfill user_id from profiles where possible (helps view joins)
UPDATE public.contributions c
SET user_id = p.user_id
FROM public.profiles p
WHERE c.user_id IS NULL AND lower(c.user_email) = lower(p.email);

CREATE OR REPLACE VIEW public.contributions_feed
WITH (security_invoker = true) AS
SELECT
  c.id,
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
  p.name AS author_name
FROM public.contributions c
LEFT JOIN public.profiles p ON p.user_id = c.user_id;

-- Make view bypass owner-only RLS so it can be public
ALTER VIEW public.contributions_feed SET (security_invoker = false);
GRANT SELECT ON public.contributions_feed TO anon, authenticated;

-- ============= profile_tags: lock down, expose via RPC keyed by referral_code =============
DROP POLICY IF EXISTS public_read_profile_tags ON public.profile_tags;
REVOKE SELECT ON public.profile_tags FROM anon;
CREATE POLICY admin_select_profile_tags ON public.profile_tags
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR lower(user_email) = lower(auth.email()));

CREATE OR REPLACE FUNCTION public.get_profile_tags(_referral_code text)
RETURNS TABLE(tag text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pt.tag
  FROM public.profiles p
  JOIN public.profile_tags pt ON lower(pt.user_email) = lower(p.email)
  WHERE p.referral_code = _referral_code;
$$;
GRANT EXECUTE ON FUNCTION public.get_profile_tags(text) TO anon, authenticated;

-- ============= validation_submissions: restrict reads to owner/admin =============
DROP POLICY IF EXISTS anon_select_validation ON public.validation_submissions;
REVOKE SELECT ON public.validation_submissions FROM anon;

-- Backfill user_id from profiles
UPDATE public.validation_submissions v
SET user_id = p.user_id
FROM public.profiles p
WHERE v.user_id IS NULL AND lower(v.email) = lower(p.email);

CREATE POLICY auth_select_own_validation ON public.validation_submissions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR lower(email) = lower(auth.email()) OR has_role(auth.uid(), 'admin'::app_role));

-- ============= waitlist_submissions: remove blanket anon update =============
DROP POLICY IF EXISTS anon_update_waitlist ON public.waitlist_submissions;

CREATE OR REPLACE FUNCTION public.mark_waitlist_x_shared(_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.waitlist_submissions SET x_shared = true WHERE id = _id;
$$;
GRANT EXECUTE ON FUNCTION public.mark_waitlist_x_shared(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.update_waitlist_task_email(_old_email text, _new_email text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.waitlist_task_submissions SET submission_email = _new_email WHERE submission_email = _old_email;
$$;
GRANT EXECUTE ON FUNCTION public.update_waitlist_task_email(text, text) TO anon, authenticated;

-- ============= waitlist_task_submissions: lock reads to admin =============
DROP POLICY IF EXISTS public_select_task_submissions ON public.waitlist_task_submissions;
REVOKE SELECT ON public.waitlist_task_submissions FROM anon;
CREATE POLICY admin_select_task_submissions ON public.waitlist_task_submissions
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============= leaderboard_scores: restrict email exposure =============
DROP POLICY IF EXISTS authenticated_read_leaderboard_scores ON public.leaderboard_scores;
CREATE POLICY auth_read_own_leaderboard ON public.leaderboard_scores
  FOR SELECT TO authenticated
  USING (lower(email) = lower(auth.email()) OR has_role(auth.uid(), 'admin'::app_role));

-- Public-safe view (no email)
CREATE OR REPLACE VIEW public.leaderboard_public AS
SELECT display_name, waitlist_xp, validation_xp, contribution_xp, total_xp, updated_at
FROM public.leaderboard_scores;
GRANT SELECT ON public.leaderboard_public TO anon, authenticated;

-- Update get_leaderboard to not return raw email (mask it)
CREATE OR REPLACE FUNCTION public.get_leaderboard(_period text DEFAULT 'all'::text)
RETURNS TABLE(email text, display_name text, period_xp integer, total_xp integer, overall_rank integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
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
  CASE
    WHEN public.has_role(auth.uid(), 'admin'::app_role) OR lower(r.email) = lower(coalesce(auth.email(),''))
    THEN r.email
    ELSE regexp_replace(r.email, '^(.{2}).*(@.*)$', '\1***\2')
  END AS email,
  r.display_name,
  CASE WHEN _period = 'all' THEN r.total_xp ELSE COALESCE(pc.period_xp, 0) END AS period_xp,
  r.total_xp,
  r.overall_rank
FROM ranked r
LEFT JOIN period_contrib pc ON pc.email = r.email
WHERE _period = 'all' OR COALESCE(pc.period_xp, 0) > 0
ORDER BY period_xp DESC, r.email ASC;
$$;

-- ============= Realtime: remove sensitive tables =============
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='user_activities') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.user_activities';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='leaderboard_scores') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.leaderboard_scores';
  END IF;
END $$;

-- ============= Revoke SECURITY DEFINER exec from anon for sensitive helpers =============
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.recalculate_leaderboard_score(text) FROM anon, public, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalculate_all_leaderboard_scores() FROM anon, public, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_whitepaper_live() FROM anon, public, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM anon, public, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated;
