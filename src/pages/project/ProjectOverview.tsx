import { useEffect, useState } from "react";
import ProjectLayout from "@/components/project/ProjectLayout";
import { PageHeader, StatCard, Panel } from "@/components/dashboard/Primitives";
import { useProject } from "@/hooks/useProject";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const ProjectOverview = () => {
  const { project } = useProject();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ contributors: 0, contributions: 0, approved: 0, xp: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ count: contributors }, { data: contributions }, { data: scores }] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("contributions").select("id,user_email,status,points_earned,post_url,created_at").order("created_at", { ascending: false }).limit(200),
        supabase.from("leaderboard_scores").select("total_xp"),
      ]);
      const list = contributions ?? [];
      setStats({
        contributors: contributors ?? 0,
        contributions: list.length,
        approved: list.filter((c: any) => c.status === "approved").length,
        xp: (scores ?? []).reduce((s: number, r: any) => s + (r.total_xp ?? 0), 0),
      });
      setRecent(list.slice(0, 8));
      setLoading(false);
    };
    load();
  }, []);

  return (
    <ProjectLayout>
      <PageHeader
        title={project?.name ? `${project.name} workspace` : "Project workspace"}
        subtitle="Discover contributors, brief campaigns and read reputation signal across the ecosystem."
      />

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <StatCard label="Contributors" value={stats.contributors} hint="Verified accounts on RaidFi" />
            <StatCard label="Contributions" value={stats.contributions} hint="Recent tracked posts" />
            <StatCard label="Approved" value={stats.approved} accent hint="Passed review" />
            <StatCard label="Ecosystem XP" value={stats.xp.toLocaleString()} hint="Total distributed" />
          </div>

          <Panel title="Latest ecosystem activity" description="The newest contributions being scored across RaidFi.">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="divide-y divide-border -my-1">
                {recent.map((c) => (
                  <li key={c.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <a href={c.post_url} target="_blank" rel="noreferrer" className="text-xs text-foreground hover:text-primary truncate block">
                        {c.post_url}
                      </a>
                      <p className="text-[11px] text-muted-foreground">
                        {c.user_email?.replace(/^(.{2}).*(@.*)$/, "$1***$2")} · {new Date(c.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-primary tabular-nums shrink-0">+{c.points_earned}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}
    </ProjectLayout>
  );
};

export default ProjectOverview;
