-- Canonical live whitepaper source table
CREATE TABLE IF NOT EXISTS public.whitepaper_live (
  id text PRIMARY KEY DEFAULT 'live',
  source_whitepaper_id uuid,
  content text NOT NULL,
  version text NOT NULL DEFAULT '1.0',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.whitepaper_live ENABLE ROW LEVEL SECURITY;

-- Public can read the current whitepaper
DROP POLICY IF EXISTS "public_read_whitepaper_live" ON public.whitepaper_live;
CREATE POLICY "public_read_whitepaper_live"
ON public.whitepaper_live
FOR SELECT
USING (true);

-- Admins can manage canonical whitepaper row
DROP POLICY IF EXISTS "admin_manage_whitepaper_live" ON public.whitepaper_live;
CREATE POLICY "admin_manage_whitepaper_live"
ON public.whitepaper_live
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Keep canonical live row synced from latest published whitepaper
CREATE OR REPLACE FUNCTION public.refresh_whitepaper_live()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  latest_row public.whitepaper%ROWTYPE;
BEGIN
  SELECT *
  INTO latest_row
  FROM public.whitepaper
  WHERE is_published = true
  ORDER BY updated_at DESC, created_at DESC
  LIMIT 1;

  IF latest_row.id IS NULL THEN
    DELETE FROM public.whitepaper_live WHERE id = 'live';
    RETURN;
  END IF;

  INSERT INTO public.whitepaper_live (
    id,
    source_whitepaper_id,
    content,
    version,
    updated_at
  )
  VALUES (
    'live',
    latest_row.id,
    latest_row.content,
    latest_row.version,
    latest_row.updated_at
  )
  ON CONFLICT (id) DO UPDATE
  SET
    source_whitepaper_id = EXCLUDED.source_whitepaper_id,
    content = EXCLUDED.content,
    version = EXCLUDED.version,
    updated_at = EXCLUDED.updated_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_whitepaper_live_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.refresh_whitepaper_live();
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_whitepaper_live_sync ON public.whitepaper;
CREATE TRIGGER trg_whitepaper_live_sync
AFTER INSERT OR UPDATE OR DELETE
ON public.whitepaper
FOR EACH STATEMENT
EXECUTE FUNCTION public.handle_whitepaper_live_sync();

-- Backfill current canonical content immediately
SELECT public.refresh_whitepaper_live();