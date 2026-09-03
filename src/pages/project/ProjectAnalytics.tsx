import { useMemo } from "react";
import ProjectLayout from "@/components/project/ProjectLayout";
import { PageHeader, Panel, StatCard } from "@/components/dashboard/Primitives";
import { useProject } from "@/hooks/useProject";
import { useProjectSignal } from "@/hooks/useProjectSignal";
import { Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const weekKey = (d: Date) => {
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return `${start.getMonth() + 1}/${start.getDate()}`;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

const ProjectAnalytics = () => {
  const { project } = useProject();
  const { loading, mentions, totals, contributors } = useProjectSignal(project);

  const series = useMemo(() => {
    const buckets = new Map<string, { label: string; mentions: number; xp: number; quality: number; n: number; people: Set<string> }>();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.now() - i * 7 * 86_400_000);
      const key = weekKey(d);
      buckets.set(key, { label: key, mentions: 0, xp: 0, quality: 0, n: 0, people: new Set() });
    }
    for (const c of mentions) {
      const key = weekKey(new Date(c.created_at));
      const b = buckets.get(key);
      if (!b) continue;
      b.mentions += 1;
      b.people.add((c.user_email ?? "").toLowerCase());
      if (c.status === "approved") b.xp += c.points_earned ?? 0;
      const s = c.manual_score ?? c.ai_score ?? 0;
      if (s) {
        b.quality = (b.quality * b.n + s) / (b.n + 1);
        b.n += 1;
      }
    }
    return [...buckets.values()].map((b) => ({
      label: b.label,
      mentions: b.mentions,
      xp: b.xp,
      contributors: b.people.size,
      quality: Number(b.quality.toFixed(1)),
    }));
  }, [mentions]);

  const statusSplit = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of mentions) counts[c.status] = (counts[c.status] ?? 0) + 1;
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [mentions]);

  const typeSplit = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of mentions) counts[c.content_type || "post"] = (counts[c.content_type || "post"] ?? 0) + 1;
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [mentions]);

  const dayOfWeek = useMemo(() => {
    const counts = DAYS.map((label) => ({ label, posts: 0 }));
    for (const c of mentions) counts[new Date(c.created_at).getDay()].posts += 1;
    return counts;
  }, [mentions]);

  const topContributors = useMemo(
    () =>
      contributors
        .slice(0, 8)
        .map((c) => ({ name: c.displayName.length > 14 ? `${c.displayName.slice(0, 13)}…` : c.displayName, xp: c.xpFromProject, posts: c.mentions })),
    [contributors],
  );

  const concentration = useMemo(() => {
    const totalXp = contributors.reduce((s, c) => s + c.xpFromProject, 0);
    const top5 = contributors.slice(0, 5).reduce((s, c) => s + c.xpFromProject, 0);
    return totalXp ? Math.round((top5 / totalXp) * 100) : 0;
  }, [contributors]);

  const aiShare = useMemo(() => {
    if (!mentions.length) return 0;
    return Math.round((mentions.filter((c) => c.ai_generated).length / mentions.length) * 100);
  }, [mentions]);

  const approvalRate = totals.mentions ? Math.round((totals.approved / totals.mentions) * 100) : 0;
  const costPerPost = totals.approved ? Math.round(totals.xp / totals.approved) : 0;
  const repeatRate = contributors.length
    ? Math.round((contributors.filter((c) => c.mentions > 1).length / contributors.length) * 100)
    : 0;
  const activeNow = contributors.filter((c) => Date.now() - new Date(c.lastActive).getTime() < 14 * 86_400_000).length;
  const dormant = contributors.length - activeNow;
  const postsPerContributor = contributors.length ? (totals.mentions / contributors.length).toFixed(1) : "0";

  const pieColors = ["hsl(var(--primary))", "hsl(var(--muted-foreground))", "hsl(var(--destructive))", "hsl(var(--primary) / 0.5)"];

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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <StatCard label="Mentions (90d)" value={totals.mentions} hint={`${totals.momentum >= 0 ? "+" : ""}${totals.momentum}% vs previous 30d`} />
            <StatCard label="XP released" value={totals.xp.toLocaleString()} accent hint={`≈ ${costPerPost} XP per approved post`} />
            <StatCard label="Repeat contributors" value={`${repeatRate}%`} hint="Posted about you more than once" />
            <StatCard label="Share of voice" value={`${totals.shareOfVoice}%`} hint="Across all RaidFi activity" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <StatCard label="Approval rate" value={`${approvalRate}%`} hint={`${totals.approved} of ${totals.mentions} reviewed posts`} />
            <StatCard label="Avg quality" value={totals.avgQuality || "-"} hint="Reviewed score out of 10" />
            <StatCard label="Active vs dormant" value={`${activeNow} / ${dormant}`} hint="Active = posted in last 14 days" />
            <StatCard label="Top-5 concentration" value={`${concentration}%`} hint={`${postsPerContributor} posts per contributor · ${aiShare}% AI-assisted`} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Panel title="Weekly mentions & rewards" description="Volume against XP released to contributors.">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
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
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" name="Avg quality" dataKey="quality" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.12)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                Rising quality with flat volume means your brief is landing. Rising volume with falling quality usually
                means the incentive is attracting farmers - tighten the reputation floor on your next campaign.
              </p>
            </Panel>

            <Panel title="Contributor participation" description="Unique people posting about you each week.">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar name="Contributors" dataKey="contributors" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Review outcomes" description="How submissions about your project are being resolved.">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusSplit} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                      {statusSplit.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11, textTransform: "capitalize" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Top contributors by XP" description="Who your rewards are actually going to.">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topContributors} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar name="XP" dataKey="xp" fill="hsl(var(--primary))" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="When people post" description="Posting activity by day of week.">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayOfWeek}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar name="Posts" dataKey="posts" fill="hsl(var(--primary) / 0.7)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                Schedule campaign briefs a day before your busiest window so content lands when your community is awake.
              </p>
            </Panel>
          </div>

          {typeSplit.length > 0 && (
            <div className="mt-4">
              <Panel title="Content mix" description="What kind of contributions your project attracts.">
                <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {typeSplit.map((t) => (
                    <li key={t.name} className="border border-border rounded-md px-3 py-2">
                      <p className="text-[11px] text-muted-foreground capitalize">{t.name.replace(/_/g, " ")}</p>
                      <p className="text-sm font-semibold text-foreground tabular-nums">
                        {t.value}
                        <span className="text-[11px] font-normal text-muted-foreground ml-1.5">
                          {Math.round((t.value / (totals.mentions || 1)) * 100)}%
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          )}
        </>
      )}
    </ProjectLayout>
  );
};

export default ProjectAnalytics;
