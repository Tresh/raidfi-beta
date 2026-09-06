import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ProjectRecord } from "@/hooks/useProject";

export interface SignalContribution {
  id: string;
  user_email: string;
  post_url: string;
  post_text: string | null;
  post_author: string | null;
  status: string;
  points_earned: number;
  manual_score: number | null;
  ai_score: number | null;
  content_type: string;
  ai_generated?: boolean | null;
  created_at: string;
  x_username?: string | null;
  display_name?: string | null;
}

export interface ContributorSignal {
  email: string;
  displayName: string;
  mentions: number;
  approved: number;
  xpFromProject: number;
  avgQuality: number;
  lastActive: string;
  totalXp: number;
  globalRank: number | null;
  xHandle: string | null;
}

const keywords = (project: ProjectRecord | null) => {
  if (!project) return [] as string[];
  const list = [project.name, project.x_handle ?? "", project.slug ?? ""]
    .map((v) => (v ?? "").replace(/^@/, "").trim().toLowerCase())
    .filter((v) => v.length >= 3);
  return [...new Set(list)];
};

/**
 * Project-scoped signal. Reads only through authorization-checked RPCs so a
 * project admin sees every contribution attributed to their project - whether
 * the contributor picked the project on submission or simply named it in the post.
 */
export function useProjectSignal(project: ProjectRecord | null) {
  const [loading, setLoading] = useState(true);
  const [mentions, setMentions] = useState<SignalContribution[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [prevStats, setPrevStats] = useState<any>(null);
  const [board, setBoard] = useState<any[]>([]);

  const load = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true);
    const now = Date.now();
    const iso = (ms: number) => new Date(ms).toISOString();

    const [activity, current, previous, leaderboard] = await Promise.all([
      supabase.rpc("project_activity" as any, {
        _project_id: project.id,
        _from: iso(now - 90 * 86_400_000),
        _to: iso(now),
        _only_project: true,
        _limit: 200,
        _offset: 0,
      } as any),
      supabase.rpc("project_period_stats" as any, {
        _project_id: project.id,
        _from: iso(now - 90 * 86_400_000),
        _to: iso(now),
      } as any),
      supabase.rpc("project_period_stats" as any, {
        _project_id: project.id,
        _from: iso(now - 60 * 86_400_000),
        _to: iso(now - 30 * 86_400_000),
      } as any),
      supabase.rpc("get_leaderboard", { _period: "all" }),
    ]);

    setMentions(
      ((activity.data as any[]) ?? []).map((r) => ({
        id: r.id,
        user_email: r.email,
        post_url: r.post_url,
        post_text: r.post_text,
        post_author: r.x_username ?? null,
        status: r.status,
        points_earned: r.points_earned ?? 0,
        manual_score: r.score ?? null,
        ai_score: null,
        content_type: r.content_type,
        ai_generated: r.ai_generated,
        created_at: r.created_at,
        x_username: r.x_username,
        display_name: r.display_name,
      })),
    );
    setStats((current.data as any) ?? null);
    setPrevStats((previous.data as any) ?? null);
    setBoard((leaderboard.data as any[]) ?? []);
    setLoading(false);
  }, [project?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const terms = useMemo(() => keywords(project), [project?.id]);

  const contributors = useMemo<ContributorSignal[]>(() => {
    const map = new Map<string, ContributorSignal>();
    for (const c of mentions) {
      const email = (c.user_email ?? "").toLowerCase();
      if (!email) continue;
      const score = c.manual_score ?? 0;
      const handle = c.x_username ? String(c.x_username).replace(/^@/, "") : null;
      const existing =
        map.get(email) ??
        ({
          email,
          displayName: handle ? `@${handle}` : c.display_name || email.replace(/^(.{2}).*(@.*)$/, "$1***$2"),
          mentions: 0,
          approved: 0,
          xpFromProject: 0,
          avgQuality: 0,
          lastActive: c.created_at,
          totalXp: 0,
          globalRank: null,
          xHandle: handle,
        } as ContributorSignal);
      existing.mentions += 1;
      if (c.status === "approved") {
        existing.approved += 1;
        existing.xpFromProject += c.points_earned ?? 0;
      }
      existing.avgQuality = (existing.avgQuality * (existing.mentions - 1) + score) / existing.mentions;
      if (new Date(c.created_at) > new Date(existing.lastActive)) existing.lastActive = c.created_at;
      map.set(email, existing);
    }
    for (const row of board) {
      const email = (row.email ?? "").toLowerCase();
      const entry = [...map.values()].find((v) => v.email === email);
      if (entry) {
        entry.totalXp = row.total_xp ?? 0;
        entry.globalRank = row.overall_rank ?? null;
      }
    }
    return [...map.values()].sort((a, b) => b.xpFromProject - a.xpFromProject || b.mentions - a.mentions);
  }, [mentions, board]);

  const totals = useMemo(() => {
    const total = Number(stats?.contributions ?? 0);
    const eco = Number(stats?.ecosystem_contributions ?? 0);
    const last30 = mentions.filter((c) => Date.now() - new Date(c.created_at).getTime() < 30 * 86_400_000).length;
    const prev30 = Number(prevStats?.contributions ?? 0);
    return {
      mentions: total,
      approved: Number(stats?.accepted ?? 0),
      pending: Number(stats?.pending ?? 0),
      contributors: Number(stats?.contributors ?? 0),
      xp: Number(stats?.xp ?? 0),
      avgQuality: Number(stats?.avg_quality ?? 0),
      shareOfVoice: eco ? Math.round((total / eco) * 100) : 0,
      last30,
      prev30,
      momentum: prev30 === 0 ? (last30 > 0 ? 100 : 0) : Math.round(((last30 - prev30) / prev30) * 100),
    };
  }, [stats, prevStats, mentions]);

  /** Prefer the contributor's X identity over any email representation. */
  const authorLabel = useMemo(
    () =>
      (c: { user_email?: string | null; post_author?: string | null; x_username?: string | null; display_name?: string | null }) => {
        const handle = c.x_username ?? c.post_author;
        if (handle) return String(handle).startsWith("@") ? String(handle) : `@${handle}`;
        if (c.display_name) return c.display_name;
        const email = (c.user_email ?? "").toLowerCase();
        return email ? email.replace(/^(.{2}).*(@.*)$/, "$1***$2") : "Unknown";
      },
    [],
  );

  return {
    loading,
    mentions,
    contributors,
    totals,
    ecosystemCount: Number(stats?.ecosystem_contributions ?? 0),
    terms,
    board,
    authorLabel,
    reload: load,
  };
}
