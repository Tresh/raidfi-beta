
CREATE OR REPLACE FUNCTION public.check_email_exists(check_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM waitlist_submissions WHERE email = check_email) THEN
    RETURN true;
  END IF;
  IF EXISTS (SELECT 1 FROM validation_submissions WHERE email = check_email) THEN
    RETURN true;
  END IF;
  RETURN false;
END;
$$;
