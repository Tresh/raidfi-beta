DROP TRIGGER IF EXISTS trg_waitlist_scores_sync ON public.waitlist_submissions;
CREATE TRIGGER trg_waitlist_scores_sync
AFTER INSERT OR UPDATE OR DELETE
ON public.waitlist_submissions
FOR EACH ROW
EXECUTE FUNCTION public.handle_leaderboard_source_change();

DROP TRIGGER IF EXISTS trg_validation_scores_sync ON public.validation_submissions;
CREATE TRIGGER trg_validation_scores_sync
AFTER INSERT OR UPDATE OR DELETE
ON public.validation_submissions
FOR EACH ROW
EXECUTE FUNCTION public.handle_leaderboard_source_change();

DROP TRIGGER IF EXISTS trg_contribution_scores_sync ON public.contributions;
CREATE TRIGGER trg_contribution_scores_sync
AFTER INSERT OR UPDATE OR DELETE
ON public.contributions
FOR EACH ROW
EXECUTE FUNCTION public.handle_leaderboard_source_change();