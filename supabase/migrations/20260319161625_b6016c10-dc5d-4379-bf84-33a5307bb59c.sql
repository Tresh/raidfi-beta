DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard_scores;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;