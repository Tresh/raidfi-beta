
-- Allow moderators with 'contributions' permission to manage contributions
CREATE POLICY "moderator_manage_contributions"
ON public.contributions
FOR ALL
TO authenticated
USING (public.has_permission(auth.uid(), 'contributions'))
WITH CHECK (public.has_permission(auth.uid(), 'contributions'));
