CREATE OR REPLACE FUNCTION public.check_beta_code(_code text)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE r public.beta_requests%ROWTYPE;
BEGIN
  SELECT * INTO r FROM public.beta_requests
  WHERE upper(code) = upper(trim(_code)) LIMIT 1;

  IF r.id IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'unknown');
  END IF;
  IF r.status NOT IN ('approved','redeemed') THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_approved');
  END IF;
  IF r.expires_at IS NOT NULL AND r.expires_at <= now() THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'expired');
  END IF;
  IF r.uses_count >= r.max_uses THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'exhausted');
  END IF;
  RETURN jsonb_build_object('valid', true, 'role', r.requested_role, 'email', r.email);
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_beta_code(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_beta_code(_code text, _email text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE r public.beta_requests%ROWTYPE;
BEGIN
  SELECT * INTO r FROM public.beta_requests
  WHERE upper(code) = upper(trim(_code))
    AND status IN ('approved','redeemed')
    AND (expires_at IS NULL OR expires_at > now())
    AND uses_count < max_uses
  LIMIT 1;

  IF r.id IS NULL THEN
    RETURN jsonb_build_object('ok', false);
  END IF;

  UPDATE public.beta_requests
  SET uses_count = uses_count + 1,
      status = CASE WHEN uses_count + 1 >= max_uses THEN 'redeemed' ELSE status END,
      reviewed_at = COALESCE(reviewed_at, now())
  WHERE id = r.id;

  UPDATE public.profiles SET beta_code = r.code WHERE lower(email) = lower(trim(_email));

  RETURN jsonb_build_object('ok', true, 'role', r.requested_role);
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_beta_code(text, text) TO anon, authenticated;