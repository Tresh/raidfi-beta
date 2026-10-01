import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Panel, StatCard } from "@/components/dashboard/Primitives";
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

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

const weekKey = (d: Date) => {
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return `${start.getMonth() + 1}/${start.getDate()}`;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pieColors = [
  "hsl(var(--primary))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--destructive))",
  "hsl(var(--primary) / 0.5)",
];

interface ProfileRow {
  id: string;
  email: string;
  name: string | null;
  x_username: string | null;
  x_verified: boolean;
  total_points: number | null;
  referral_count: number | null;
  referral_code: string | null;
  created_at: string | null;
}

interface ContributionRow {
  id: string;
  user_email: string;
  project_id: string | null;
  content_type: string | null;
  status: string;
  points_earned: number | null;
  manual_score: number | null;
  ai_score: number | null;
  created_at: string;
}

interface ProjectRow {
  id: string;
  name: string;
  slug: string;
  status: string;
}

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [contributions, setContributions] = useState<ContributionRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [betaRequestsCount, setBetaRequestsCount] = useState(0);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      const [
        { data: profs },
        { data: contribs },
        { data: projs },
        { count: betaCount },
      ] = await Promise.all([
        supabase.from("profiles").select("id, email, name, x_username, x_verified, total_points, referral_count, referral_code, created_at").limit(2000),
        supabase.from("contributions").select("id, user_email, project_id, content_type, status, points_earned, manual_score, ai_score, created_at").order("created_at", { ascending: true }).limit(5000),
        supabase.from("projects" as any).select("id, name, slug, status"),
        supabase.from("beta_requests" as any).select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      setProfiles((profs as any) || []);
      setContributions((contribs as any) || []);
      setProjects((projs as any) || []);
      setBetaRequestsCount(betaCount || 0);
      setLoading(false);
    };

    loadAll();
  }, []);

  // Time-series Weekly bucket data (past 12 weeks)
  const series = useMemo(() => {
    const buckets = new Map<
      string,
      { label: string; submissions: number; xp: number; quality: number; n: number; contributors: Set<string> }
    >();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.now() - i * 7 * 86_400_000);
      const key = weekKey(d);
      buckets.set(key, { label: key, submissions: 0, xp: 0, quality: 0, n: 0, contributors: new Set() });
    }

    for (const c of contributions) {
      const key = weekKey(new Date(c.created_at));
      const b = buckets.get(key);
      if (!b) continue;
      b.submissions += 1;
      if (c.user_email) b.contributors.add(c.user_email.toLowerCase());
      if (c.status === "approved") b.xp += c.points_earned ?? 0;
      const score = c.manual_score ?? c.ai_score ?? 0;
      if (score > 0) {
        b.quality = (b.quality * b.n + score) / (b.n + 1);
        b.n += 1;
      }
    }

    return [...buckets.values()].map((b) => ({
      label: b.label,
      submissions: b.submissions,
      xp: b.xp,
      contributors: b.contributors.size,
      quality: Number(b.quality.toFixed(1)),
    }));
  }, [contributions]);

  // Totals & Ratios
  const totals = useMemo(() => {
    const totalSubmissions = contributions.length;
    const approvedList = contributions.filter((c) => c.status === "approved");
    const totalApproved = approvedList.length;
    const totalXP = approvedList.reduce((acc, c) => acc + (c.points_earned || 0), 0);
    const approvalRate = totalSubmissions > 0 ? Math.round((totalApproved / totalSubmissions) * 100) : 0;

    const scored = contributions.filter((c) => (c.manual_score ?? c.ai_score ?? 0) > 0);
    const avgQuality = scored.length
      ? (scored.reduce((s, c) => s + (c.manual_score ?? c.ai_score ?? 0), 0) / scored.length).toFixed(1)
      : "0";

    const activeContributorsCount = new Set(
      contributions
        .filter((c) => Date.now() - new Date(c.created_at).getTime() < 30 * 86_400_000)
        .map((c) => (c.user_email || "").toLowerCase())
    ).size;

    return {
      totalSubmissions,
      totalApproved,
      totalXP,
      approvalRate,
      avgQuality,
      activeContributorsCount,
      totalProfiles: profiles.length,
      activeProjects: projects.filter((p) => p.status === "active").length,
    };
  }, [contributions, profiles, projects]);

  // Breakdown by Status
  const statusSplit = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of contributions) counts[c.status] = (counts[c.status] ?? 0) + 1;
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [contributions]);

  // Breakdown by Content Type
  const typeSplit = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of contributions) {
      const type = (c.content_type || "post").replace(/_/g, " ");
      counts[type] = (counts[type] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [contributions]);

  // Breakdown by Day of Week
  const dayOfWeek = useMemo(() => {
    const counts = DAYS.map((label) => ({ label, posts: 0 }));
    for (const c of contributions) counts[new Date(c.created_at).getDay()].posts += 1;
    return counts;
  }, [contributions]);

  // Top Projects by Activity
  const topProjectsByActivity = useMemo(() => {
    const projMap = new Map<string, string>();
    projects.forEach((p) => projMap.set(p.id, p.name));

    const counts: Record<string, { name: string; count: number; xp: number }> = {};
    for (const c of contributions) {
      if (!c.project_id) continue;
      const name = projMap.get(c.project_id) || "Workspace";
      if (!counts[c.project_id]) counts[c.project_id] = { name, count: 0, xp: 0 };
      counts[c.project_id].count += 1;
      if (c.status === "approved") counts[c.project_id].xp += c.points_earned || 0;
    }

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [contributions, projects]);

  // Top Contributors by XP
  const topContributors = useMemo(() => {
    const map = new Map<string, { email: string; name: string; xp: number; posts: number }>();
    for (const p of profiles) {
      map.set(p.email.toLowerCase(), {
        email: p.email,
        name: p.name || p.x_username || p.email.split("@")[0],
        xp: p.total_points || 0,
        posts: 0,
      });
    }

    for (const c of contributions) {
      const emailKey = (c.user_email || "").toLowerCase();
      const entry = map.get(emailKey);
      if (entry) {
        entry.posts += 1;
      }
    }

    return [...map.values()]
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 8);
  }, [profiles, contributions]);

  // Top Referrers
  const topReferrers = useMemo(() => {
    return profiles
      .filter((p) => (p.referral_count || 0) > 0)
      .sort((a, b) => (b.referral_count || 0) - (a.referral_count || 0))
      .slice(0, 8);
  }, [profiles]);

  return (
    <div>
      <PageHeader
        title="Platform Analytics"
        subtitle="Comprehensive metrics on RaidFi Beta activity, contribution volume, quality trends, and community growth."
      />

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stat Cards Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <StatCard
              label="Active Contributors"
              value={totals.activeContributorsCount}
              hint={`out of ${totals.totalProfiles} total registered accounts`}
              accent
            />
            <StatCard
              label="Live Projects"
              value={totals.activeProjects}
              hint={`${projects.length} total workspaces in platform`}
            />
            <StatCard
              label="Total Contributions"
              value={totals.totalSubmissions}
              hint={`${totals.totalApproved} approved contributions`}
            />
            <StatCard
              label="XP Distributed"
              value={totals.totalXP.toLocaleString()}
              hint={`Approval rate ${totals.approvalRate}%`}
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard
              label="Average Quality"
              value={totals.avgQuality}
              hint="Reviewed score out of 10"
            />
            <StatCard
              label="Beta Queue"
              value={betaRequestsCount}
              hint="Pending invite requests"
            />
            <StatCard
              label="Referrals Made"
              value={profiles.reduce((a, b) => a + (b.referral_count || 0), 0)}
              hint="Organic invite loops"
            />
            <StatCard
              label="X Verified Accounts"
              value={profiles.filter((p) => p.x_verified).length}
              hint={`${Math.round((profiles.filter((p) => p.x_verified).length / (profiles.length || 1)) * 100)}% identity verified`}
            />
          </div>

          {/* Main Visual Panels */}
          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <Panel title="Weekly Submissions & XP Released" description="Global contribution volume vs awarded XP over time.">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" name="Submissions" dataKey="submissions" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" />
                    <Area type="monotone" name="XP Released" dataKey="xp" stroke="hsl(var(--muted-foreground))" fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Contribution Quality Trend" description="Average quality score across reviewed contributions.">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" name="Avg Quality" dataKey="quality" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.12)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Contribution Status Mix" description="Distribution of pending, approved, and rejected submissions.">
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

            <Panel title="Activity by Day of Week" description="When contributors post across the ecosystem.">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayOfWeek}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar name="Posts" dataKey="posts" fill="hsl(var(--primary) / 0.8)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          {/* Project Activity & Content Mix */}
          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <Panel title="Most Active Projects" description="Projects receiving the highest volume of community contributions.">
              {topProjectsByActivity.length === 0 ? (
                <p className="text-xs text-muted-foreground py-8 text-center">No project contributions recorded yet.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProjectsByActivity} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar name="Contributions" dataKey="count" fill="hsl(var(--primary))" radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>

            <Panel title="Content Mix" description="Types of contributions submitted by ecosystem raiders.">
              <ul className="grid sm:grid-cols-2 gap-2 mt-2">
                {typeSplit.map((t) => (
                  <li key={t.name} className="border border-border rounded-lg p-3 bg-card">
                    <p className="text-xs text-muted-foreground capitalize">{t.name}</p>
                    <p className="text-xl font-bold text-foreground mt-0.5 tabular-nums">
                      {t.value}
                      <span className="text-xs font-normal text-muted-foreground ml-2">
                        ({Math.round((t.value / (totals.totalSubmissions || 1)) * 100)}%)
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* Leaderboards */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Panel title="Top Contributors by XP" description="Highest earning contributors on RaidFi.">
              <div className="space-y-2">
                {topContributors.map((c, i) => (
                  <div key={c.email} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-muted-foreground w-4">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-primary">{c.xp.toLocaleString()} XP</span>
                      <p className="text-[11px] text-muted-foreground">{c.posts} posts</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Top Referrers" description="Contributors driving growth through invite codes.">
              <div className="space-y-2">
                {topReferrers.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-8 text-center">No referrals yet.</p>
                ) : (
                  topReferrers.map((r, i) => (
                    <div key={r.email} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-muted-foreground w-4">#{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{r.name || r.x_username || "Contributor"}</p>
                          <p className="text-xs text-muted-foreground">{r.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-primary">{r.referral_count} invites</span>
                        <p className="text-[11px] font-mono text-muted-foreground">{r.referral_code}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
