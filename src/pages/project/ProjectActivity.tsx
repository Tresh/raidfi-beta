import { useMemo, useState } from "react";
import ProjectLayout from "@/components/project/ProjectLayout";
import { PageHeader, Panel } from "@/components/dashboard/Primitives";
import { useProject } from "@/hooks/useProject";
import { PERIODS, rangeForDays, useProjectActivity, usePeriodStats } from "@/hooks/useProjectData";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Loader2 } from "lucide-react";

const STATUSES = ["all", "approved", "pending", "rejected"];

const Stat = ({ label, value, delta }: { label: string; value: string | number; delta?: number | null }) => (
  <div className="border border-border rounded-lg bg-card p-3">
    <p className="text-[11px] text-muted-foreground">{label}</p>
    <p className="text-lg font-semibold text-foreground tabular-nums mt-0.5">{value}</p>
    {delta != null && Number.isFinite(delta) && (
      <p className={`text-[11px] mt-0.5 ${delta >= 0 ? "text-primary" : "text-destructive"}`}>
        {delta >= 0 ? "+" : ""}{delta}% vs previous period
      </p>
    )}
  </div>
);

const ProjectActivity = () => {
  const { project } = useProject();
  const [periodKey, setPeriodKey] = useState("30");
  const days = Number(periodKey);
  const range = useMemo(() => rangeForDays(days), [days]);
  const prevRange = useMemo(
    () => ({
      from: new Date(Date.now() - days * 2 * 86_400_000).toISOString(),
      to: new Date(Date.now() - days * 86_400_000).toISOString(),
    }),
    [days],
  );
  const [onlyProject, setOnlyProject] = useState(true);
  const [status, setStatus] = useState("all");
  const { rows, loading, hasMore, loadMore } = useProjectActivity(project, range, onlyProject, 40);
  const { current, previous } = usePeriodStats(project, range, prevRange);

  const filtered = useMemo(
    () => (status === "all" ? rows : rows.filter((r) => r.status === status)),
    [rows, status],
  );

  const pct = (a?: number, b?: number) =>
    !b ? null : Math.round((((a ?? 0) - b) / b) * 100);

  return (
    <ProjectLayout>
      <PageHeader
        title="Activity"
        subtitle="What actually happened around your project - posts, people and momentum."
        action={
          <Select value={periodKey} onValueChange={setPeriodKey}>
            <SelectTrigger className="h-8 w-[148px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => <SelectItem key={p.key} value={p.key} className="text-xs">{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Posts" value={current?.contributions ?? 0} delta={pct(current?.contributions, previous?.contributions)} />
        <Stat label="Active contributors" value={current?.contributors ?? 0} delta={pct(current?.contributors, previous?.contributors)} />
        <Stat label="Approved" value={current?.approved ?? 0} delta={pct(current?.approved, previous?.approved)} />
        <Stat label="Avg quality" value={current?.avg_score ? Math.round(current.avg_score) : "-"} delta={pct(current?.avg_score, previous?.avg_score)} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="inline-flex rounded-full border border-border p-0.5">
          {[{ k: true, l: "About us" }, { k: false, l: "All RaidFi" }].map((o) => (
            <button
              key={String(o.k)}
              onClick={() => setOnlyProject(o.k)}
              className={`text-[11.5px] px-3 h-7 rounded-full ${onlyProject === o.k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {o.l}
            </button>
          ))}
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs capitalize">{s === "all" ? "Any status" : s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Panel title="Recent contributions">
        {loading && rows.length === 0 ? (
          <div className="py-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Nothing in this period.</p>
        ) : (
          <ul className="divide-y divide-border -my-1">
            {filtered.map((r) => (
              <li key={r.id} className="py-2.5 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] text-foreground">
                    {r.display_name}
                    {r.x_username && <span className="text-muted-foreground ml-1.5">@{r.x_username.replace(/^@/, "")}</span>}
                  </p>
                  {r.post_text && <p className="text-[11.5px] text-muted-foreground line-clamp-2 mt-0.5">{r.post_text}</p>}
                  <p className="text-[10.5px] text-muted-foreground mt-1">
                    {new Date(r.created_at).toLocaleString()} · {r.status} · +{r.points_earned} XP
                    {r.score != null ? ` · quality ${r.score}` : ""}
                  </p>
                </div>
                <a href={r.post_url} target="_blank" rel="noreferrer" className="text-primary shrink-0 mt-1">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            ))}
          </ul>
        )}
        {hasMore && (
          <Button variant="outline" size="sm" className="w-full h-8 text-xs mt-3" onClick={loadMore}>Load more</Button>
        )}
      </Panel>
    </ProjectLayout>
  );
};

export default ProjectActivity;
