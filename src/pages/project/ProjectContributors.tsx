import { useMemo, useState } from "react";
import ProjectLayout from "@/components/project/ProjectLayout";
import { PageHeader, Panel } from "@/components/dashboard/Primitives";
import { useProject } from "@/hooks/useProject";
import { useProjectSignal } from "@/hooks/useProjectSignal";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

const TABS = [
  { key: "community", label: "Your community" },
  { key: "discover", label: "Discover talent" },
] as const;

const tierOf = (xp: number) =>
  xp >= 2000 ? "Core" : xp >= 1000 ? "Trusted" : xp >= 400 ? "Established" : xp >= 100 ? "Emerging" : "New";

const ProjectContributors = () => {
  const { project } = useProject();
  const { loading, contributors, board } = useProjectSignal(project);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("community");
  const [q, setQ] = useState("");
  const [minXp, setMinXp] = useState(0);

  const community = useMemo(
    () => contributors.filter((c) => q.trim() === "" || c.displayName.toLowerCase().includes(q.trim().toLowerCase())),
    [contributors, q],
  );

  const discover = useMemo(
    () =>
      (board as any[])
        .filter((r) => (r.total_xp ?? 0) >= minXp)
        .filter((r) => q.trim() === "" || (r.display_name ?? "").toLowerCase().includes(q.trim().toLowerCase()))
        .filter((r) => !contributors.some((c) => c.displayName === r.display_name))
        .slice(0, 60),
    [board, q, minXp, contributors],
  );

  return (
    <ProjectLayout>
      <PageHeader
        title="Contributors"
        subtitle="Your active community first — then proven contributors who haven't posted about you yet."
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              tab === t.key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name" className="pl-9 h-9" />
        </div>
        {tab === "discover" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            Min XP
            <Input type="number" min={0} step={50} value={minXp} onChange={(e) => setMinXp(Number(e.target.value))} className="h-9 w-24" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : tab === "community" ? (
        <Panel title="Community leaderboard" description="Ranked by reviewed value delivered to your project.">
          {community.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No contributor has posted about {project?.name ?? "your project"} yet. Brief a campaign to get started.
            </p>
          ) : (
            <ul className="divide-y divide-border -my-1">
              {community.map((c, i) => (
                <li key={c.email} className="py-3 flex items-center gap-3">
                  <span className="w-6 text-xs tabular-nums text-muted-foreground">#{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                    {(c.displayName || "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">{c.displayName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {c.mentions} post{c.mentions === 1 ? "" : "s"} · {c.approved} approved · avg quality{" "}
                      {c.avgQuality.toFixed(1)} · last {new Date(c.lastActive).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-primary tabular-nums">{c.xpFromProject} XP</p>
                    <p className="text-[10.5px] text-muted-foreground">
                      {tierOf(c.totalXp)}{c.globalRank ? ` · global #${c.globalRank}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ) : (
        <Panel title="Discover talent" description="High-reputation contributors you haven't reached yet.">
          {discover.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No contributors match those filters.</p>
          ) : (
            <ul className="divide-y divide-border -my-1">
              {discover.map((r: any) => (
                <li key={r.email} className="py-3 flex items-center gap-3">
                  <span className="w-8 text-xs tabular-nums text-muted-foreground">#{r.overall_rank}</span>
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center shrink-0">
                    {(r.display_name || "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">{r.display_name}</p>
                    <p className="text-[11px] text-muted-foreground">{tierOf(r.total_xp ?? 0)} contributor</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground tabular-nums shrink-0">
                    {(r.total_xp ?? 0).toLocaleString()} XP
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </ProjectLayout>
  );
};

export default ProjectContributors;
