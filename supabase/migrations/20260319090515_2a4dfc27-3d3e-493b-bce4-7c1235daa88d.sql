
-- 1. Referral code generator
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- 2. Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  referral_code text UNIQUE NOT NULL DEFAULT public.generate_referral_code(),
  referral_count int DEFAULT 0,
  waitlist_completed boolean DEFAULT false,
  x_shared boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin_all_profiles" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Waitlist tasks table
CREATE TABLE public.waitlist_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type text NOT NULL,
  label text NOT NULL,
  url text NOT NULL,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.waitlist_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_active_tasks" ON public.waitlist_tasks FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "admin_manage_tasks" ON public.waitlist_tasks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Seed default tasks
INSERT INTO public.waitlist_tasks (task_type, label, url, sort_order) VALUES
  ('telegram', 'Join our Telegram', 'https://t.me/raidfi_community', 1),
  ('x_follow', 'Follow us on X', 'https://x.com/intent/follow?screen_name=RaidFi_App', 2),
  ('x_comment', 'Comment on this post', 'https://x.com/RaidFi_App/status/2032132831103856646', 3);

-- 5. Alter waitlist_submissions
ALTER TABLE public.waitlist_submissions
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS referred_by text,
  ADD COLUMN IF NOT EXISTS x_shared boolean DEFAULT false;

-- 6. Update check_email_exists
CREATE OR REPLACE FUNCTION public.check_email_exists(check_email text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM waitlist_submissions WHERE email = check_email) THEN RETURN true; END IF;
  IF EXISTS (SELECT 1 FROM validation_submissions WHERE email = check_email) THEN RETURN true; END IF;
  IF EXISTS (SELECT 1 FROM profiles WHERE email = check_email) THEN RETURN true; END IF;
  RETURN false;
END;
$$;

-- 7. Process referral function
CREATE OR REPLACE FUNCTION public.process_referral(referrer_code text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE profiles SET referral_count = referral_count + 1 WHERE referral_code = referrer_code;
END;
$$;
