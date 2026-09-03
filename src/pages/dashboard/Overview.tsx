import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useContributorData } from "@/hooks/useContributorData";
import { useSEO } from "@/hooks/useSEO";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageHeader, Panel, ScoreMeter, StatCard, StatusPill } from "@/components/dashboard/Primitives";
import { weeklySeries } from "@/lib/reputation";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ArrowUpRight, ExternalLink, Loader2 } from "lucide-react";

const Overview = () => {
  useSEO({
    title: "Dashboard - RaidFi",
    description: "Your contribution intelligence overview: reputation score, activity and performance.",
    path: "/dashboard",
  });
  const { session } = useAuth();
  const data = useContributorData(session?.user?.email);
  const { reputation: rep } = data;
  const series = weeklySeries(data.contributions, 12);

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome back${data.profile?.name ? `, ${data.profile.name}` : ""}`}
        subtitle="A behavioral view of your contribution record across RaidFi."
        action={
          <Link
            to="/dashboard/contributions"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md bg-primary text-primary-foreground"
          >
            Submit contribution <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      {data.loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Reputation" value={rep.score} hint={rep.tier.name} accent />
            <StatCard label="Total XP" value={data.totalXp.toLocaleString()} hint="All-time" />
            <StatCard
              label="Rank"
              value={data.rank ? `#${data.rank}` : "-"}
              hint={data.cohortSize ? `of ${data.cohortSize} contributors` : "Unranked"}
            />
            <StatCard
              label="Active streak"
              value={`${rep.currentStreakWeeks}w`}
              hint={`${rep.activeWeeks}/12 weeks active`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Panel title="Contribution trend" description="Accepted XP and submissions per week, last 12 weeks.">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={series} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        interval={1}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="xp"
                        name="XP"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#xpFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>

            <Panel title="Reputation signals" description="Weighted pillars behind your score.">
              <div className="space-y-3.5">
                {rep.pillars.map((p) => (
                  <div key={p.key}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-foreground">{p.label}</span>
                      <span className="text-muted-foreground tabular-nums">{Math.round(p.value)}</span>
                    </div>
                    <ScoreMeter value={p.value} />
                  </div>
                ))}
                <Link
                  to="/dashboard/reputation"
                  className="inline-flex items-center gap-1 text-xs text-primary pt-1"
                >
                  How this is calculated <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </Panel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel
              title="Recent contributions"
              description={`${rep.approvedCount} accepted of ${rep.totalCount} submitted`}
            >
              {data.contributions.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">
                  No contributions tracked yet.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {data.contributions.slice(0, 5).map((c) => (
                    <li key={c.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-foreground line-clamp-2">
                          {c.post_text?.replace(/&mdash;/g, "-") || c.post_url}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(c.created_at).toLocaleDateString()} · {c.content_type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusPill status={c.status} />
                        <a href={c.post_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Activity log" description="Scoring events on your account.">
              {data.activities.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">No activity yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {data.activities.slice(0, 6).map((a) => (
                    <li key={a.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-foreground truncate">{a.description}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(a.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-primary tabular-nums shrink-0">
                        +{a.points}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Overview;
