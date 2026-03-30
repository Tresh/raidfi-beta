
-- Per-moderator page permissions
CREATE TABLE public.moderator_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  permission text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, permission)
);

ALTER TABLE public.moderator_permissions ENABLE ROW LEVEL SECURITY;

-- Only admins can manage permissions
CREATE POLICY "admin_manage_mod_permissions"
ON public.moderator_permissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Moderators can read their own permissions
CREATE POLICY "mod_read_own_permissions"
ON public.moderator_permissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Security definer function to check if user has a specific permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Admins have all permissions
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin')
    OR
    -- Moderators need explicit permission
    (
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'moderator')
      AND EXISTS (SELECT 1 FROM public.moderator_permissions WHERE user_id = _user_id AND permission = _permission)
    )
$$;
