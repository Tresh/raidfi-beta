/*
# Add docs_content table for admin-edited documentation pages

## 1. Plain-English summary

The /docs pages render markdown content. This migration adds a `docs_content`
table so administrators can edit the content of any docs page (including the
whitepaper) from the admin panel, and the public docs site then shows the
edited version instead of the built-in text.

## 2. New tables

- `docs_content`
  - `slug` (text, primary key) — docs page identifier, e.g. "introduction",
    "whitepaper", "changelog". One row per docs page.
  - `body` (text, not null) — markdown content of the page.
  - `updated_at` (timestamptz, not null, defaults to now()) — freshness marker,
    kept current automatically by a trigger.
  - `updated_by` (uuid, nullable) — admin user who last saved the page.

## 3. New functions

- `public.is_docs_admin()` — SECURITY DEFINER, STABLE helper that returns true
  when the caller is signed in and holds an 'admin' or 'super_admin' row in the
  `user_roles` table. If the `user_roles` table does not exist in the current
  database, it safely returns false instead of erroring, so public page reads
  keep working everywhere.

## 4. Modified tables

None.

## 5. Security changes

- Row Level Security ENABLED on `docs_content`.
- Public read: anyone (anon or authenticated) can SELECT pages — the docs site
  is public.
- Admin-only writes: INSERT / UPDATE / DELETE require `public.is_docs_admin()`,
  matching the app's existing `has_role`-based permission model. Write policies
  are scoped `TO authenticated` so anonymous visitors can never modify content.

## 6. Important notes

- All statements are idempotent: safe to run again without errors.
- No data is deleted; the table starts empty and the app falls back to its
  built-in content for any page without a row.
- `anon` and `authenticated` get SELECT via the public policy; no grants beyond
  the default table privileges are needed because policies govern access.
*/

CREATE TABLE IF NOT EXISTS docs_content (
  slug text PRIMARY KEY,
  body text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE docs_content ENABLE ROW LEVEL SECURITY;

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
