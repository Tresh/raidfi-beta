ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS logo_data_url text;

-- Populate logo_data_url on projects from project_requests where available
UPDATE public.projects p
SET logo_data_url = r.logo_data_url
FROM public.project_requests r
WHERE (lower(p.contact_email) = lower(r.email) OR lower(p.name) = lower(r.project_name))
  AND r.logo_data_url IS NOT NULL
  AND p.logo_data_url IS NULL;
