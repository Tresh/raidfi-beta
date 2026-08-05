import { useMemo } from "react";
import ProjectLayout from "@/components/project/ProjectLayout";
import { PageHeader, Panel, StatCard } from "@/components/dashboard/Primitives";
import { useProject } from "@/hooks/useProject";
import { useProjectSignal } from "@/hooks/useProjectSignal";
import { Loader2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

const weekKey = (d: Date) => {
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return `${start.getMonth() + 1}/${start.getDate()}`;
};

const ProjectAnalytics = () => {
  const { project } = useProject();
  const { loading, mentions, totals, contributors } = useProjectSignal(project);

  const series = useMemo(() => {
    const buckets = new Map<string, { label: string; mentions: number; xp: number; quality: number; n: number }>();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.now() - i * 7 * 86_400_000);
      const key = weekKey(d);
      buckets.set(key, { label: key, mentions: 0, xp: 0, quality: 0, n: 0 });
    }
    for (const c of mentions) {
      const key = weekKey(new Date(c.created_at));
      const b = buckets.get(key);
      if (!b) continue;
      b.mentions += 1;
      if (c.status === "approved") b.xp += c.points_earned ?? 0;
      const s = c.manual_score ?? c.ai_score ?? 0;
      if (s) {
        b.quality = (b.quality * b.n + s) / (b.n + 1);
        b.n += 1;
      }
    }
    return [...buckets.values()].map((b) => ({ ...b, quality: Number(b.quality.toFixed(1)) }));
  }, [mentions]);

  const costPerPost = totals.approved ? Math.round(totals.xp / totals.approved) : 0;
  const repeatRate = contributors.length
    ? Math.round((contributors.filter((c) => c.mentions > 1).length / contributors.length) * 100)
    : 0;

  return (
    <ProjectLayout>
      <PageHeader
        title="Analytics"
        subtitle="Does contribution activity around your project actually compound? These are the numbers that answer it."
      />

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <StatCard label="Mentions (90d)" value={totals.mentions} />
            <StatCard label="XP released" value={totals.xp.toLocaleString()} accent hint={`≈ ${costPerPost} XP per approved post`} />
            <StatCard label="Repeat contributors" value={`${repeatRate}%`} hint="Posted about you more than once" />
            <StatCard label="Share of voice" value={`${totals.shareOfVoice}%`} hint="Across all RaidFi activity" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Panel title="Weekly mentions & rewards" description="Volume against XP released to contributors.">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" name="Mentions" dataKey="mentions" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" />
                    <Area type="monotone" name="XP" dataKey="xp" stroke="hsl(var(--muted-foreground))" fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Content quality trend" description="Average reviewed score of posts about you.">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" name="Avg quality" dataKey="quality" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.12)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                Rising quality with flat volume means your brief is landing. Rising volume with falling quality usually
                means the incentive is attracting farmers — tighten the reputation floor on your next campaign.
              </p>
            </Panel>
          </div>
        </>
      )}
    </ProjectLayout>
  );
};

export default ProjectAnalytics;
