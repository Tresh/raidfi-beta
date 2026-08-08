import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ProjectRecord } from "@/hooks/useProject";
import { ContributorRow, deriveMetrics } from "@/lib/projectMetrics";

export const PERIODS = [
  { key: "7", label: "Last 7 days", days: 7 },
  { key: "14", label: "Last 14 days", days: 14 },
  { key: "30", label: "Last 30 days", days: 30 },
  { key: "90", label: "Last 90 days", days: 90 },
  { key: "180", label: "Last 6 months", days: 180 },
  { key: "365", label: "Last 12 months", days: 365 },
] as const;

export interface Range {
  from: string;
  to: string;
}

export function rangeForDays(days: number): Range {
  return {
    from: new Date(Date.now() - days * 86_400_000).toISOString(),
    to: new Date().toISOString(),
  };
}

/**
 * Single source of truth for project-scoped contributor data.
 * Everything (Find, Activity, Evaluate, AI Analyst) reads through this layer,
 * which calls server-side, authorization-checked RPCs.
 */
export function useProjectContributors(project: ProjectRecord | null, range: Range) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ContributorRow[]>([]);

  const load = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.rpc("project_contributor_analytics" as any, {
      _project_id: project.id,
      _from: range.from,
      _to: range.to,
    } as any);
    if (err) {
      setError(err.message);
      setRows([]);
    } else {
      const weeks = Math.max(1, Math.round((new Date(range.to).getTime() - new Date(range.from).getTime()) / (7 * 86_400_000)));
      setRows(((data as any[]) ?? []).map((r) => deriveMetrics(r as ContributorRow, weeks)));
    }
    setLoading(false);
  }, [project?.id, range.from, range.to]);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, error, rows, reload: load };
}

export interface ActivityRow {
  id: string;
  email: string;
  display_name: string;
  x_username: string | null;
  referral_code: string | null;
  post_url: string;
  post_text: string | null;
  status: string;
  content_type: string;
  media_type: string | null;
  ai_generated: boolean | null;
  score: number | null;
  points_earned: number;
  created_at: string;
  is_project: boolean;
}

export function useProjectActivity(
  project: ProjectRecord | null,
  range: Range,
  onlyProject: boolean,
  limit = 60,
) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchPage = useCallback(
    async (off: number, append: boolean) => {
      if (!project?.id) return;
      setLoading(true);
      const { data } = await supabase.rpc("project_activity" as any, {
        _project_id: project.id,
        _from: range.from,
        _to: range.to,
        _only_project: onlyProject,
        _limit: limit,
        _offset: off,
      } as any);
      const page = ((data as any[]) ?? []) as ActivityRow[];
      setRows((prev) => (append ? [...prev, ...page] : page));
      setHasMore(page.length === limit);
      setLoading(false);
    },
    [project?.id, range.from, range.to, onlyProject, limit],
  );

  useEffect(() => {
    setOffset(0);
    fetchPage(0, false);
  }, [fetchPage]);

  const loadMore = () => {
    const next = offset + limit;
    setOffset(next);
    fetchPage(next, true);
  };

  return { loading, rows, hasMore, loadMore };
}

export function usePeriodStats(project: ProjectRecord | null, a: Range, b: Range | null) {
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<any>(null);
  const [previous, setPrevious] = useState<any>(null);

  useEffect(() => {
    if (!project?.id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const calls = [
        supabase.rpc("project_period_stats" as any, { _project_id: project.id, _from: a.from, _to: a.to } as any),
      ];
      if (b) calls.push(supabase.rpc("project_period_stats" as any, { _project_id: project.id, _from: b.from, _to: b.to } as any));
      const res = await Promise.all(calls);
      if (cancelled) return;
      setCurrent(res[0]?.data ?? null);
      setPrevious(res[1]?.data ?? null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [project?.id, a.from, a.to, b?.from, b?.to]);

  return { loading, current, previous };
}

/** Saved searches / views / contributor lists. */
export function useSavedViews(project: ProjectRecord | null, kind?: string) {
  const [views, setViews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!project?.id) return;
    let q = supabase.from("project_saved_views" as any).select("*").eq("project_id", project.id);
    if (kind) q = q.eq("kind", kind);
    const { data } = await q.order("created_at", { ascending: false });
    setViews((data as any[]) ?? []);
    setLoading(false);
  }, [project?.id, kind]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (name: string, config: unknown, viewKind = kind ?? "search") => {
    if (!project?.id) return;
    const { data: session } = await supabase.auth.getUser();
    await supabase.from("project_saved_views" as any).insert({
      project_id: project.id,
      name,
      kind: viewKind,
      config: config as any,
      created_by: session?.user?.id ?? null,
    } as any);
    await load();
  };

  const remove = async (id: string) => {
    await supabase.from("project_saved_views" as any).delete().eq("id", id);
    await load();
  };

  return { views, loading, save, remove, reload: load };
}

export function useContributorLists(project: ProjectRecord | null) {
  const [lists, setLists] = useState<any[]>([]);
  const load = useCallback(async () => {
    if (!project?.id) return;
    const { data } = await supabase
      .from("project_contributor_lists" as any)
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });
    setLists((data as any[]) ?? []);
  }, [project?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (name: string, emails: string[], note?: string) => {
    if (!project?.id) return;
    const { data: session } = await supabase.auth.getUser();
    await supabase.from("project_contributor_lists" as any).insert({
      project_id: project.id,
      name,
      emails,
      note: note ?? null,
      created_by: session?.user?.id ?? null,
    } as any);
    await load();
  };

  const remove = async (id: string) => {
    await supabase.from("project_contributor_lists" as any).delete().eq("id", id);
    await load();
  };

  return { lists, create, remove, reload: load };
}

/** Convenience: aggregate stats for a selected group of contributors. */
export function groupSummary(rows: ContributorRow[]) {
  if (!rows.length) return null;
  const num = (k: keyof ContributorRow) => rows.map((r) => Number(r[k] ?? 0));
  const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  const median = (a: number[]) => {
    const s = [...a].sort((x, y) => x - y);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  const contributions = num("contributions").reduce((a, b) => a + b, 0);
  const accepted = num("accepted").reduce((a, b) => a + b, 0);
  const active = rows.filter((r) => (r.days_since_last ?? 999) <= 14).length;
  const returning = rows.filter((r) => r.active_weeks >= 2).length;

  const sorted = [...rows].sort((a, b) => (b.reputation ?? 0) - (a.reputation ?? 0));
  return {
    size: rows.length,
    contributions,
    accepted,
    acceptanceRate: contributions ? (accepted / contributions) * 100 : 0,
    avgReputation: avg(num("reputation")),
    medianReputation: median(num("reputation")),
    avgQuality: avg(num("quality")),
    medianQuality: median(num("quality")),
    avgConsistency: avg(num("consistency")),
    activePct: (active / rows.length) * 100,
    returningPct: (returning / rows.length) * 100,
    top: sorted.slice(0, 3),
    bottom: sorted.slice(-3).reverse(),
  };
}
