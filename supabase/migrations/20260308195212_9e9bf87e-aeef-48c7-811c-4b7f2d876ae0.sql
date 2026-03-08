
-- Contributions table for submitted X posts
CREATE TABLE public.contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  post_url TEXT NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 10,
  engagement_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Engagement tracking table
CREATE TABLE public.contribution_engagements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contribution_id UUID NOT NULL REFERENCES public.contributions(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contribution_id, user_email)
);

-- Enable RLS
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_engagements ENABLE ROW LEVEL SECURITY;

-- Anyone can read contributions (public feed)
CREATE POLICY "public_read_contributions" ON public.contributions
  FOR SELECT USING (true);

-- Authenticated users can insert contributions
CREATE POLICY "auth_insert_contributions" ON public.contributions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update their own contributions
CREATE POLICY "auth_update_own_contributions" ON public.contributions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Anyone can read engagements
CREATE POLICY "public_read_engagements" ON public.contribution_engagements
  FOR SELECT USING (true);

-- Authenticated users can insert engagements
CREATE POLICY "auth_insert_engagements" ON public.contribution_engagements
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin can manage all
CREATE POLICY "admin_manage_contributions" ON public.contributions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin_manage_engagements" ON public.contribution_engagements
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
