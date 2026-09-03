import { useState } from "react";
import { Link } from "react-router-dom";
import ProjectLayout from "@/components/project/ProjectLayout";
import { PageHeader, StatCard, Panel } from "@/components/dashboard/Primitives";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/useProject";
import { useProjectSignal } from "@/hooks/useProjectSignal";
import { Loader2, TrendingDown, TrendingUp, ExternalLink } from "lucide-react";

const ProjectOverview = () => {
  const { project } = useProject();
  const { loading, mentions, contributors, totals, terms, authorLabel } = useProjectSignal(project);
  const [visible, setVisible] = useState(5);


  return (
    <ProjectLayout>
      <PageHeader
        title={project?.name ? `${project.name} signal` : "Project workspace"}
        subtitle="Who is talking about your project, how good that content is, and where the momentum is going."
      />

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <StatCard label="Mentions" value={totals.mentions} hint="Tracked posts about you (90d)" />
            <StatCard label="Active contributors" value={totals.contributors} accent hint="People creating for you" />
            <StatCard label="Avg. quality" value={totals.avgQuality || "-"} hint="Reviewed score out of 10" />
            <StatCard label="Share of voice" value={`${totals.shareOfVoice}%`} hint="Of all RaidFi contributions" />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-4">
              <Panel title="Momentum" description="Last 30 days vs the 30 before.">
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-semibold tabular-nums text-foreground">{totals.last30}</span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium mb-1 ${
                      totals.momentum >= 0 ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {totals.momentum >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {totals.momentum > 0 ? "+" : ""}{totals.momentum}%
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  {totals.prev30} mentions in the previous period. {totals.approved} of your {totals.mentions} tracked
                  posts passed review, releasing {totals.xp.toLocaleString()} XP to contributors.
                </p>
              </Panel>

              <Panel title="Top contributors" description="Ranked by reviewed value delivered to you.">
                {contributors.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No one has posted about you yet.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {contributors.slice(0, 6).map((c, i) => (
                      <li key={c.email} className="flex items-center gap-2.5">
                        <span className="w-5 text-[11px] tabular-nums text-muted-foreground">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-foreground truncate">{c.displayName}</p>
                          <p className="text-[10.5px] text-muted-foreground">
                            {c.mentions} post{c.mentions === 1 ? "" : "s"} · avg {c.avgQuality.toFixed(1)}
                            {c.globalRank ? ` · global #${c.globalRank}` : ""}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-primary tabular-nums">{c.xpFromProject}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/project/contributors" className="mt-3 inline-block text-[11px] text-primary">
                  See the full community leaderboard →
                </Link>
              </Panel>
            </div>

            <div className="lg:col-span-2">
              <Panel
                title="Recent mentions"
                description={terms.length ? `Matching: ${terms.join(", ")}` : "Add your X handle in settings to track mentions."}
              >
                {mentions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    Nothing yet. Contributions naming your project or handle will appear here automatically.
                  </p>
                ) : (
                  <>
                    <ul className="divide-y divide-border -my-1">
                      {mentions.slice(0, visible).map((c) => (
                        <li key={c.id} className="py-3">
                          <p className="text-xs text-foreground line-clamp-2">
                            {c.post_text?.replace(/&mdash;/g, "-") || c.post_url}
                          </p>
                          <div className="mt-1 flex items-center justify-between gap-3">
                            <p className="text-[11px] text-muted-foreground truncate">
                              {authorLabel(c)} ·{" "}
                              {new Date(c.created_at).toLocaleDateString()} · {c.status}
                              {c.ai_generated ? " · AI-assisted" : ""}
                            </p>
                            <a href={c.post_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary shrink-0">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {mentions.length > visible && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs mt-3"
                        onClick={() => setVisible((v) => v + 5)}
                      >
                        Load 5 more ({mentions.length - visible} left)
                      </Button>
                    )}
                  </>
                )}

              </Panel>
            </div>
          </div>
        </>
      )}
    </ProjectLayout>
  );
};

export default ProjectOverview;
