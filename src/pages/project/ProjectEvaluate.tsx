import { useMemo, useState } from "react";
import ProjectLayout from "@/components/project/ProjectLayout";
import ContributorTable from "@/components/project/ContributorTable";
import CriteriaBar from "@/components/project/CriteriaBar";
import { PageHeader, Panel } from "@/components/dashboard/Primitives";
import { useProject } from "@/hooks/useProject";
import { PERIODS, rangeForDays, useProjectContributors } from "@/hooks/useProjectData";
import { DEFAULT_COLUMNS, Filter, applyFilters } from "@/lib/projectMetrics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const avg = (nums: number[]) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0);
const median = (nums: number[]) => {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const ProjectEvaluate = () => {
  const { project } = useProject();
  const [periodKey, setPeriodKey] = useState("90");
  const range = useMemo(() => rangeForDays(Number(periodKey)), [periodKey]);
  const { rows, loading } = useProjectContributors(project, range);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [columns, setColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const pool = useMemo(() => applyFilters(rows, filters), [rows, filters]);
  const group = useMemo(() => (selected.size ? pool.filter((r) => selected.has(r.email)) : pool), [pool, selected]);

  const summary = useMemo(() => {
    if (!group.length) return null;
    const quality = group.map((r) => Number(r.quality ?? 0));
    const accepted = group.reduce((a, r) => a + Number(r.accepted ?? 0), 0);
    const total = group.reduce((a, r) => a + Number(r.contributions ?? 0), 0);
    const activeRecently = group.filter((r) => Number(r.days_since_last ?? 999) <= 14).length;
    const returning = group.filter((r) => Number(r.contributions ?? 0) > 1).length;
    const sortedByQuality = [...group].sort((a, b) => Number(b.quality ?? 0) - Number(a.quality ?? 0));
    return {
      size: group.length,
      avgQuality: Math.round(avg(quality)),
      medianQuality: Math.round(median(quality)),
      acceptance: total ? Math.round((accepted / total) * 100) : 0,
      contributions: total,
      activePct: Math.round((activeRecently / group.length) * 100),
      returningPct: Math.round((returning / group.length) * 100),
      top: sortedByQuality.slice(0, 3),
      weak: sortedByQuality.slice(-3).reverse(),
    };
  }, [group]);

  return (
    <ProjectLayout>
      <PageHeader
        title="Evaluate"
        subtitle="Understand how a person — or a group you select — has actually contributed over time."
        action={
          <Select value={periodKey} onValueChange={setPeriodKey}>
            <SelectTrigger className="h-8 w-[148px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => <SelectItem key={p.key} value={p.key} className="text-xs">{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <div className="mb-4"><CriteriaBar filters={filters} onChange={setFilters} /></div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-4">
          {summary && (
            <Panel
              title={selected.size ? `Group of ${summary.size} selected` : `All ${summary.size} matching contributors`}
              description="Tick rows in the table below to evaluate a specific group. Every number here is explained underneath it."
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  [
                    "Typical content quality",
                    `${summary.avgQuality}/100`,
                    "Average review score of their contributions.",
                  ],
                  [
                    "Middle of the group",
                    `${summary.medianQuality}/100`,
                    "Half score above this, half below — less skewed by one standout.",
                  ],
                  [
                    "Contributions that passed review",
                    `${summary.acceptance}%`,
                    "Of everything they submitted, how much was accepted as real contribution.",
                  ],
                  [
                    "Contributions tracked",
                    summary.contributions,
                    "Total submissions in this period.",
                  ],
                  [
                    "Still active",
                    `${summary.activePct}%`,
                    "Contributed at least once in the last 14 days.",
                  ],
                  [
                    "Came back again",
                    `${summary.returningPct}%`,
                    "Contributed more than once — a sign of consistency, not a one-off.",
                  ],
                ].map(([l, v, hint]) => (
                  <div key={String(l)}>
                    <p className="text-[11px] text-muted-foreground">{l}</p>
                    <p className="text-base font-semibold text-foreground tabular-nums">{v}</p>
                    <p className="text-[10.5px] text-muted-foreground leading-snug mt-0.5">{hint}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Strongest contributors</p>
                  <ul className="space-y-1">
                    {summary.top.map((r) => (
                      <li key={r.email} className="text-[12.5px] text-foreground">
                        {r.display_name} <span className="text-muted-foreground">· quality {r.quality}/100 · {r.contributions} contributions</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Worth a closer look</p>
                  <ul className="space-y-1">
                    {summary.weak.map((r) => (
                      <li key={r.email} className="text-[12.5px] text-foreground">
                        {r.display_name} <span className="text-muted-foreground">· quality {r.quality}/100 · last contributed {r.days_since_last ?? "—"} days ago</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Panel>
          )}

          <ContributorTable
            rows={pool}
            columns={columns}
            onColumnsChange={setColumns}
            selected={selected}
            onSelectedChange={setSelected}
            emptyState="No contributors match these criteria in this period."
          />
        </div>
      )}
    </ProjectLayout>
  );
};

export default ProjectEvaluate;
