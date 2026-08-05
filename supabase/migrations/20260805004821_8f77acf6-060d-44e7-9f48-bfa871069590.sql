ALTER TABLE public.contributions
  ADD COLUMN IF NOT EXISTS ai_generated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'text';

ALTER TABLE public.beta_requests
  ADD COLUMN IF NOT EXISTS from_waitlist boolean NOT NULL DEFAULT false;

ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS referral_xp_per_signup integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS project_referral_percent numeric NOT NULL DEFAULT 10;

CREATE TABLE IF NOT EXISTS public.project_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_email text NOT NULL,
  project_name text NOT NULL,
  contact_email text,
  note text,
  status text NOT NULL DEFAULT 'pending',
  commission_percent numeric NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.project_referrals TO authenticated;
GRANT ALL ON public.project_referrals TO service_role;

ALTER TABLE public.project_referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own referrals readable" ON public.project_referrals;
CREATE POLICY "own referrals readable" ON public.project_referrals
  FOR SELECT TO authenticated
  USING (lower(referrer_email) = lower(coalesce(auth.email(), '')) OR public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "own referrals insertable" ON public.project_referrals;
CREATE POLICY "own referrals insertable" ON public.project_referrals
  FOR INSERT TO authenticated
  WITH CHECK (lower(referrer_email) = lower(coalesce(auth.email(), '')));

DROP POLICY IF EXISTS "staff manage referrals" ON public.project_referrals;
CREATE POLICY "staff manage referrals" ON public.project_referrals
  FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));