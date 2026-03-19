CREATE OR REPLACE FUNCTION public.handle_profile_leaderboard_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF pg_trigger_depth() > 1 THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
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

SELECT public.recalculate_all_leaderboard_scores();