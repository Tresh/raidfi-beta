CREATE OR REPLACE FUNCTION public.handle_profile_leaderboard_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

DROP TRIGGER IF EXISTS trg_profile_scores_sync ON public.profiles;
CREATE TRIGGER trg_profile_scores_sync
AFTER INSERT OR UPDATE OR DELETE
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_profile_leaderboard_sync();