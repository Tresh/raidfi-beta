import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { computeReputation, ReputationResult } from "@/lib/reputation";

export interface ContributionRow {
  id: string;
  post_url: string;
  post_text: string | null;
  post_author: string | null;
  points_earned: number;
  status: string;
  content_type: string;
  manual_score: number | null;
  ai_score: number | null;
  ai_feedback: string | null;
  created_at: string;
}

export interface ActivityRow {
  id: string;
  activity_type: string;
  description: string;
  points: number;
  created_at: string;
}

export interface ContributorProfile {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  referral_code: string | null;
  referral_count: number | null;
  total_points: number | null;
  created_at: string | null;
}

export interface ContributorData {
  loading: boolean;
  email: string | null;
  profile: ContributorProfile | null;
  contributions: ContributionRow[];
  activities: ActivityRow[];
  totalXp: number;
  rank: number | null;
  cohortSize: number;
  telegramLinked: boolean;
  reputation: ReputationResult;
  refresh: () => Promise<void>;
}

export function useContributorData(email: string | null | undefined): ContributorData {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ContributorProfile | null>(null);
  const [contributions, setContributions] = useState<ContributionRow[]>([]);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [rank, setRank] = useState<number | null>(null);
  const [cohortSize, setCohortSize] = useState(0);
  const [telegramLinked, setTelegramLinked] = useState(false);

  const load = useCallback(async () => {
    if (!email) return;
    const lower = email.toLowerCase();

    const [profileRes, contribRes, activityRes, boardRes, tgRes] = await Promise.all([
      supabase.from("profiles").select("*").ilike("email", lower).maybeSingle(),
      supabase
        .from("contributions")
        .select(
          "id,post_url,post_text,post_author,points_earned,status,content_type,manual_score,ai_score,ai_feedback,created_at"
        )
        .ilike("user_email", lower)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("user_activities")
        .select("id,activity_type,description,points,created_at")
        .ilike("user_email", lower)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase.rpc("get_leaderboard", { _period: "all" }),
      supabase.from("telegram_links").select("telegram_user_id").ilike("email", lower).maybeSingle(),
    ]);

    setProfile((profileRes.data as any) ?? null);
    setContributions(((contribRes.data as any) ?? []) as ContributionRow[]);
    setActivities(((activityRes.data as any) ?? []) as ActivityRow[]);
    setTelegramLinked(Boolean(tgRes.data));

    const board = (boardRes.data as any[]) ?? [];
    setCohortSize(board.length);
    const mine = board.find(
      (r) => (r.email ?? "").toLowerCase() === lower || (r.display_name ?? "").toLowerCase() === lower
    );
    if (mine) {
      setRank(mine.overall_rank ?? null);
      setTotalXp(mine.total_xp ?? 0);
    } else {
      setRank(null);
      setTotalXp(((profileRes.data as any)?.total_points as number) ?? 0);
    }

    setLoading(false);
  }, [email]);

  useEffect(() => {
    if (!email) return;
    setLoading(true);
    load();
  }, [email, load]);

  const reputation = computeReputation({
    contributions,
    telegramLinked,
    referralCount: profile?.referral_count ?? 0,
    accountCreatedAt: profile?.created_at ?? null,
  });

  return {
    loading,
    email: email ?? null,
    profile,
    contributions,
    activities,
    totalXp,
    rank,
    cohortSize,
    telegramLinked,
    reputation,
    refresh: load,
  };
}
