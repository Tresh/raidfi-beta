
-- Alter waitlist_tasks
ALTER TABLE waitlist_tasks ADD COLUMN IF NOT EXISTS requires_input boolean DEFAULT false;
ALTER TABLE waitlist_tasks ADD COLUMN IF NOT EXISTS input_label text;
ALTER TABLE waitlist_tasks ADD COLUMN IF NOT EXISTS input_placeholder text;
ALTER TABLE waitlist_tasks ADD COLUMN IF NOT EXISTS verification_type text DEFAULT 'manual';

-- Create waitlist_task_submissions
CREATE TABLE IF NOT EXISTS waitlist_task_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_email text NOT NULL,
  task_id uuid NOT NULL REFERENCES waitlist_tasks(id) ON DELETE CASCADE,
  clicked_at timestamptz,
  verified_at timestamptz,
  input_value text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waitlist_task_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_task_submissions" ON waitlist_task_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin_all_task_submissions" ON waitlist_task_submissions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "public_select_task_submissions" ON waitlist_task_submissions FOR SELECT TO anon, authenticated USING (true);

-- Create contribute_tasks
CREATE TABLE IF NOT EXISTS contribute_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  description text,
  points integer NOT NULL DEFAULT 0,
  task_type text NOT NULL DEFAULT 'link',
  url text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contribute_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_active_contribute_tasks" ON contribute_tasks FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "admin_manage_contribute_tasks" ON contribute_tasks FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create contribute_task_completions
CREATE TABLE IF NOT EXISTS contribute_task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  task_id uuid NOT NULL REFERENCES contribute_tasks(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, task_id)
);

ALTER TABLE contribute_task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_read_own_completions" ON contribute_task_completions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_own_completions" ON contribute_task_completions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin_all_completions" ON contribute_task_completions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Alter profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_points integer DEFAULT 0;
