import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useContributorData } from "@/hooks/useContributorData";
import { useSEO } from "@/hooks/useSEO";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageHeader, Panel, ScoreMeter, StatCard } from "@/components/dashboard/Primitives";
import { weeklySeries } from "@/lib/reputation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2 } from "lucide-react";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

const Analytics = () => {
  useSEO({
    title: "Analytics - RaidFi",
    description: "Contribution analytics: cadence, quality distribution and performance trends.",
    path: "/dashboard/analytics",
  });
  const { session } = useAuth();
  const data = useContributorData(session?.user?.email);
  const series = weeklySeries(data.contributions, 12);

  const byType = useMemo(() => {
    const map = new Map<string, { type: string; count: number; xp: number }>();
    data.contributions.forEach((c) => {
      const key = c.content_type || "post";
      const row = map.get(key) ?? { type: key, count: 0, xp: 0 };
      row.count += 1;
      if (c.status === "approved") row.xp += c.points_earned ?? 0;
      map.set(key, row);
    });
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [data.contributions]);

  const bestWeek = series.reduce((a, b) => (b.xp > a.xp ? b : a), series[0] ?? { xp: 0, label: "-" });
  const last4 = series.slice(-4).reduce((s, w) => s + w.xp, 0);
  const prev4 = series.slice(-8, -4).reduce((s, w) => s + w.xp, 0);
  const delta = prev4 === 0 ? (last4 > 0 ? 100 : 0) : Math.round(((last4 - prev4) / prev4) * 100);

  return (
    <DashboardLayout>
      <PageHeader
        title="Analytics"
        subtitle="How your contribution behavior is trending over time."
      />

      {data.loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="XP last 4 weeks" value={last4} accent />
            <StatCard
              label="vs previous 4"
              value={`${delta >= 0 ? "+" : ""}${delta}%`}
              hint={`${prev4} XP prior`}
            />
            <StatCard label="Best week" value={bestWeek?.xp ?? 0} hint={bestWeek?.label} />
            <StatCard label="Formats used" value={byType.length} hint="Distinct content types" />
          </div>

          <Panel title="Weekly cadence" description="Submissions per week over the last 12 weeks.">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    interval={1}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
                  <Bar
                    dataKey="contributions"
                    name="Submissions"
                    fill="hsl(var(--primary))"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={26}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title="XP trajectory" description="Accepted XP earned per week.">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      interval={1}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="xp"
                      name="XP"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Contribution mix" description="Where your activity is concentrated.">
              {byType.length === 0 ? (
                <p className="text-xs text-muted-foreground py-10 text-center">No data yet.</p>
              ) : (
                <div className="space-y-3.5">
                  {byType.map((t) => {
                    const pct = (t.count / data.contributions.length) * 100;
                    return (
                      <div key={t.type}>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-foreground capitalize">{t.type.replace(/_/g, " ")}</span>
                          <span className="text-muted-foreground tabular-nums">
                            {t.count} · {t.xp} XP
                          </span>
                        </div>
                        <ScoreMeter value={pct} />
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Analytics;
