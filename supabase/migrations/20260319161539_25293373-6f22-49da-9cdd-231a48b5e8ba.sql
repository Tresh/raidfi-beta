CREATE OR REPLACE FUNCTION public.handle_leaderboard_source_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'contributions' THEN
    IF TG_OP = 'DELETE' THEN
      PERFORM public.recalculate_leaderboard_score(OLD.user_email);
      RETURN OLD;
    END IF;

    PERFORM public.recalculate_leaderboard_score(NEW.user_email);

    IF TG_OP = 'UPDATE' AND OLD.user_email IS DISTINCT FROM NEW.user_email THEN
      PERFORM public.recalculate_leaderboard_score(OLD.user_email);
    END IF;

    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_leaderboard_score(OLD.email);
    RETURN OLD;
  END IF;

  PERFORM public.recalculate_leaderboard_score(NEW.email);

  IF TG_OP = 'UPDATE' AND OLD.email IS DISTINCT FROM NEW.email THEN
    PERFORM public.recalculate_leaderboard_score(OLD.email);
  END IF;

  RETURN NEW;
END;
$$;