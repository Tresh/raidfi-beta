import { useEffect, useMemo, useState } from "react";
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
 * Project-scoped signal: which contributions actually mention this project,
 * who is driving them, and how that compares to the wider ecosystem.
 */
export function useProjectSignal(project: ProjectRecord | null) {
  const [loading, setLoading] = useState(true);
  const [all, setAll] = useState<SignalContribution[]>([]);
  const [board, setBoard] = useState<any[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [handles, setHandles] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const [{ data: contributions }, { data: leaderboard }, { data: profiles }] = await Promise.all([
        supabase
          .from("contributions")
          .select("id,user_email,post_url,post_text,post_author,status,points_earned,manual_score,ai_score,content_type,ai_generated,created_at")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(1000),
        supabase.rpc("get_leaderboard", { _period: "all" }),
        supabase.from("profiles").select("email,name,x_username"),
      ]);
      if (cancelled) return;
      setAll(((contributions as any) ?? []) as SignalContribution[]);
      setBoard((leaderboard as any) ?? []);
      const map: Record<string, string> = {};
      const handleMap: Record<string, string> = {};
      for (const p of (profiles as any[]) ?? []) {
        if (!p.email) continue;
        const key = p.email.toLowerCase();
        map[key] = p.name ?? "";
        if (p.x_username) handleMap[key] = String(p.x_username).replace(/^@/, "");
      }
      setNames(map);
      setHandles(handleMap);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [project?.id]);

  const terms = useMemo(() => keywords(project), [project?.id]);

  const mentions = useMemo(() => {
    if (!terms.length) return [] as SignalContribution[];
    return all.filter((c) => {
      const haystack = `${c.post_text ?? ""} ${c.post_url}`.toLowerCase();
      return terms.some((t) => haystack.includes(t));
    });
  }, [all, terms]);

  const contributors = useMemo<ContributorSignal[]>(() => {
    const map = new Map<string, ContributorSignal>();
    for (const c of mentions) {
      const email = (c.user_email ?? "").toLowerCase();
      if (!email) continue;
      const score = c.manual_score ?? c.ai_score ?? 0;
      const existing = map.get(email) ?? {
        email,
        displayName: handles[email]
          ? `@${handles[email]}`
          : names[email] || email.replace(/^(.{2}).*(@.*)$/, "$1***$2"),
        mentions: 0,
        approved: 0,
        xpFromProject: 0,
        avgQuality: 0,
        lastActive: c.created_at,
        totalXp: 0,
        globalRank: null,
        xHandle: handles[email] ?? null,
      };
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
      const entry = [...map.values()].find(
        (v) => v.email === email || v.displayName === row.display_name,
      );
      if (entry) {
        entry.totalXp = row.total_xp ?? 0;
        entry.globalRank = row.overall_rank ?? null;
        if (row.display_name && !entry.xHandle) entry.displayName = row.display_name;
      }
    }
    return [...map.values()].sort((a, b) => b.xpFromProject - a.xpFromProject || b.mentions - a.mentions);
  }, [mentions, board, names, handles]);

  const totals = useMemo(() => {
    const approved = mentions.filter((c) => c.status === "approved");
    const quality =
      mentions.reduce((s, c) => s + (c.manual_score ?? c.ai_score ?? 0), 0) / (mentions.length || 1);
    const last30 = mentions.filter(
      (c) => Date.now() - new Date(c.created_at).getTime() < 30 * 86_400_000,
    ).length;
    const prev30 = mentions.filter((c) => {
      const age = Date.now() - new Date(c.created_at).getTime();
      return age >= 30 * 86_400_000 && age < 60 * 86_400_000;
    }).length;
    return {
      mentions: mentions.length,
      approved: approved.length,
      contributors: contributors.length,
      xp: approved.reduce((s, c) => s + (c.points_earned ?? 0), 0),
      avgQuality: Number(quality.toFixed(1)),
      shareOfVoice: all.length ? Math.round((mentions.length / all.length) * 100) : 0,
      last30,
      prev30,
      momentum: prev30 === 0 ? (last30 > 0 ? 100 : 0) : Math.round(((last30 - prev30) / prev30) * 100),
    };
  }, [mentions, contributors, all]);

  /** Prefer the contributor's X identity over any email representation. */
  const authorLabel = useMemo(
    () => (c: { user_email?: string | null; post_author?: string | null }) => {
      const email = (c.user_email ?? "").toLowerCase();
      if (handles[email]) return `@${handles[email]}`;
      if (c.post_author) return c.post_author.startsWith("@") ? c.post_author : `@${c.post_author}`;
      if (names[email]) return names[email];
      return email ? email.replace(/^(.{2}).*(@.*)$/, "$1***$2") : "Unknown";
    },
    [handles, names],
  );

  return { loading, mentions, contributors, totals, ecosystemCount: all.length, terms, board, handles, authorLabel };
}
