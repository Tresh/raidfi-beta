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

interface CacheEntry {
  profile: ContributorProfile | null;
  contributions: ContributionRow[];
  activities: ActivityRow[];
  totalXp: number;
  rank: number | null;
  cohortSize: number;
  telegramLinked: boolean;
}

// Keeps data across dashboard page changes so navigation doesn't feel like a reload.
const cache = new Map<string, CacheEntry>();

export function useContributorData(email: string | null | undefined): ContributorData {
  const cached = email ? cache.get(email.toLowerCase()) : undefined;
  const [loading, setLoading] = useState(!cached);
  const [profile, setProfile] = useState<ContributorProfile | null>(cached?.profile ?? null);
  const [contributions, setContributions] = useState<ContributionRow[]>(cached?.contributions ?? []);
  const [activities, setActivities] = useState<ActivityRow[]>(cached?.activities ?? []);
  const [totalXp, setTotalXp] = useState(cached?.totalXp ?? 0);
  const [rank, setRank] = useState<number | null>(cached?.rank ?? null);
  const [cohortSize, setCohortSize] = useState(cached?.cohortSize ?? 0);
  const [telegramLinked, setTelegramLinked] = useState(cached?.telegramLinked ?? false);


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

    let nextProfile = ((profileRes.data as any) ?? null) as ContributorProfile | null;
    if (nextProfile && !nextProfile.referral_code) {
      try {
        const { data: codeData } = await supabase.rpc("generate_referral_code");
        const refCode = codeData || lower.split("@")[0].substring(0, 8).toUpperCase();
        await supabase.from("profiles").update({ referral_code: refCode } as any).eq("id", nextProfile.id);
        nextProfile.referral_code = refCode;
      } catch (err) {
        console.error("Referral code error:", err);
      }
    }
    const nextContributions = (((contribRes.data as any) ?? []) as ContributionRow[]);
    const nextActivities = (((activityRes.data as any) ?? []) as ActivityRow[]);
    const nextTelegram = Boolean(tgRes.data);

    setProfile(nextProfile);
    setContributions(nextContributions);
    setActivities(nextActivities);
    setTelegramLinked(nextTelegram);

    const board = (boardRes.data as any[]) ?? [];
    setCohortSize(board.length);
    const mine = board.find(
      (r) => (r.email ?? "").toLowerCase() === lower || (r.display_name ?? "").toLowerCase() === lower
    );
    const nextRank = mine ? (mine.overall_rank ?? null) : null;
    const nextXp = mine ? (mine.total_xp ?? 0) : ((nextProfile?.total_points as number) ?? 0);
    setRank(nextRank);
    setTotalXp(nextXp);

    cache.set(lower, {
      profile: nextProfile,
      contributions: nextContributions,
      activities: nextActivities,
      totalXp: nextXp,
      rank: nextRank,
      cohortSize: board.length,
      telegramLinked: nextTelegram,
    });

    setLoading(false);
  }, [email]);

  useEffect(() => {
    if (!email) return;
    if (!cache.has(email.toLowerCase())) setLoading(true);
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
