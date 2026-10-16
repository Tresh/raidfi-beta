CREATE TABLE public.project_api_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  api_key_id uuid REFERENCES public.project_api_keys(id) ON DELETE SET NULL,
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code int NOT NULL,
  response_time_ms int NOT NULL DEFAULT 0,
  rate_limited boolean NOT NULL DEFAULT false,
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX project_api_logs_proj_time ON public.project_api_logs(project_id, created_at DESC);
CREATE INDEX project_api_logs_key_time ON public.project_api_logs(api_key_id, created_at DESC);
GRANT SELECT ON public.project_api_logs TO authenticated;
GRANT ALL ON public.project_api_logs TO service_role;
ALTER TABLE public.project_api_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project admins read api logs" ON public.project_api_logs FOR SELECT TO authenticated
USING (public.is_project_admin(auth.uid(), project_id) OR public.is_staff(auth.uid()));

CREATE TABLE public.project_api_idempotency (
  api_key_id uuid NOT NULL REFERENCES public.project_api_keys(id) ON DELETE CASCADE,
  idem_key text NOT NULL,
  status_code int NOT NULL,
  response jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (api_key_id, idem_key)
);
GRANT ALL ON public.project_api_idempotency TO service_role;
ALTER TABLE public.project_api_idempotency ENABLE ROW LEVEL SECURITY;

-- Atomic per-key per-minute counter
CREATE TABLE public.project_api_rate (
  api_key_id uuid NOT NULL REFERENCES public.project_api_keys(id) ON DELETE CASCADE,
  bucket text NOT NULL,
  window_start timestamptz NOT NULL,
  hits int NOT NULL DEFAULT 0,
  PRIMARY KEY (api_key_id, bucket, window_start)
);
GRANT ALL ON public.project_api_rate TO service_role;
ALTER TABLE public.project_api_rate ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.api_rate_hit(_key uuid, _bucket text)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE w timestamptz := date_trunc('minute', now()); n int;
BEGIN
  INSERT INTO public.project_api_rate(api_key_id, bucket, window_start, hits) VALUES (_key, _bucket, w, 1)
  ON CONFLICT (api_key_id, bucket, window_start) DO UPDATE SET hits = project_api_rate.hits + 1
  RETURNING hits INTO n;
  IF random() < 0.01 THEN
    DELETE FROM public.project_api_rate WHERE window_start < now() - interval '10 minutes';
    DELETE FROM public.project_api_idempotency WHERE created_at < now() - interval '24 hours';
    DELETE FROM public.project_api_logs WHERE created_at < now() - interval '30 days';
  END IF;
  RETURN n;
END $$;
REVOKE EXECUTE ON FUNCTION public.api_rate_hit(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.api_rate_hit(uuid, text) TO service_role;