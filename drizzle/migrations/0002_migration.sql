ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS logo_data_url text;
UPDATE public.projects p SET logo_data_url = r.logo_data_url
FROM public.project_requests r
WHERE p.logo_data_url IS NULL AND r.logo_data_url IS NOT NULL AND lower(r.project_name) = lower(p.name);

CREATE OR REPLACE VIEW public.public_projects AS
SELECT id, name, slug, website, x_handle, telegram, description, verification, status, trust_score, x_verified, created_at, logo_data_url
FROM public.projects
WHERE status = 'active' AND is_private = false;
GRANT SELECT ON public.public_projects TO anon, authenticated;