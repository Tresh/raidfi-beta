-- ============================================================
-- RaidFi docs_content table + RLS + admin-write guard
-- Run this on your own Supabase/Postgres setup.
-- Idempotent: safe to re-run.
-- ============================================================

-- 1. Table ---------------------------------------------------
CREATE TABLE IF NOT EXISTS docs_content (
  slug        text PRIMARY KEY,
  body        text NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE docs_content ENABLE ROW LEVEL SECURITY;

-- 2. Admin-check helper (SECURITY DEFINER) ------------------
-- Returns true when the signed-in caller holds an 'admin' or
-- 'super_admin' row in user_roles. Falls back to false if the
-- table isn't present, so public reads never break.
CREATE OR REPLACE FUNCTION public.is_docs_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_role boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    ) INTO v_has_role;
  EXCEPTION
    WHEN undefined_table THEN
      RETURN false;
  END;
  RETURN COALESCE(v_has_role, false);
END;
$$;

-- 3. Policies: public read, admin-only writes ---------------
DROP POLICY IF EXISTS "docs_content_public_select" ON docs_content;
CREATE POLICY "docs_content_public_select"
ON docs_content FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "docs_content_admin_insert" ON docs_content;
CREATE POLICY "docs_content_admin_insert"
ON docs_content FOR INSERT
TO authenticated
WITH CHECK (public.is_docs_admin());

DROP POLICY IF EXISTS "docs_content_admin_update" ON docs_content;
CREATE POLICY "docs_content_admin_update"
ON docs_content FOR UPDATE
TO authenticated
USING (public.is_docs_admin())
WITH CHECK (public.is_docs_admin());

DROP POLICY IF EXISTS "docs_content_admin_delete" ON docs_content;
CREATE POLICY "docs_content_admin_delete"
ON docs_content FOR DELETE
TO authenticated
USING (public.is_docs_admin());

-- 4. Auto-touch updated_at on update ------------------------
CREATE OR REPLACE FUNCTION public.set_docs_content_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS docs_content_set_updated_at ON docs_content;
CREATE TRIGGER docs_content_set_updated_at
BEFORE UPDATE ON docs_content
FOR EACH ROW EXECUTE FUNCTION public.set_docs_content_updated_at();
