import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, TrendingUp, Award, Share2, BarChart3, ArrowUpRight, ArrowDownRight,
  Zap, Target, UserCheck, MessageSquare, Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TopReferrer {
  email: string;
  name: string | null;
  referral_count: number;
  referral_code: string;
}

interface TopContributor {
  email: string;
  display_name: string;
  total_xp: number;
  contribution_xp: number;
}

interface GrowthData {
  date: string;
  count: number;
}

interface OverviewStats {
  totalUsers: number;
  totalContributions: number;
  pendingContributions: number;
  approvedContributions: number;
  rejectedContributions: number;
  totalWaitlist: number;
  totalValidations: number;
  totalContacts: number;
  totalXPDistributed: number;
  avgXPPerUser: number;
  totalReferrals: number;
  totalTaskCompletions: number;
}

const AnalyticsPage = () => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [topContributors, setTopContributors] = useState<TopContributor[]>([]);
  const [recentGrowth, setRecentGrowth] = useState<{ waitlist: GrowthData[]; contributions: GrowthData[] }>({
    waitlist: [],
    contributions: [],
  });
  const [topContributionUsers, setTopContributionUsers] = useState<{ email: string; count: number; approved: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchOverview(),
      fetchTopReferrers(),
      fetchTopContributors(),
      fetchGrowth(),
      fetchTopContributionUsers(),
      fetchRecentActivity(),
    ]);
    setLoading(false);
  };

  const fetchOverview = async () => {
    const [
      { count: totalWaitlist },
      { count: totalValidations },
      { count: totalContacts },
      { count: totalContributions },
      { count: pendingContributions },
      { count: approvedContributions },
      { count: rejectedContributions },
      { data: leaderboard },
      { data: profiles },
      { count: totalTaskCompletions },
    ] = await Promise.all([
      supabase.from("waitlist_submissions").select("id", { count: "exact", head: true }),
      supabase.from("validation_submissions").select("id", { count: "exact", head: true }),
      supabase.from("contact_submissions").select("id", { count: "exact", head: true }),
      supabase.from("contributions").select("id", { count: "exact", head: true }),
      supabase.from("contributions").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("contributions").select("id", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("contributions").select("id", { count: "exact", head: true }).eq("status", "rejected"),
      supabase.from("leaderboard_scores").select("total_xp"),
      supabase.from("profiles").select("referral_count"),
      supabase.from("contribute_task_completions").select("id", { count: "exact", head: true }),
    ]);

    const totalXP = (leaderboard || []).reduce((s, r) => s + (r.total_xp || 0), 0);
    const userCount = (leaderboard || []).length;
    const totalReferrals = (profiles || []).reduce((s, r) => s + (r.referral_count || 0), 0);

    setStats({
      totalUsers: userCount,
      totalContributions: totalContributions || 0,
      pendingContributions: pendingContributions || 0,
      approvedContributions: approvedContributions || 0,
      rejectedContributions: rejectedContributions || 0,
      totalWaitlist: totalWaitlist || 0,
      totalValidations: totalValidations || 0,
      totalContacts: totalContacts || 0,
      totalXPDistributed: totalXP,
      avgXPPerUser: userCount > 0 ? Math.round(totalXP / userCount) : 0,
      totalReferrals,
      totalTaskCompletions: totalTaskCompletions || 0,
    });
  };

  const fetchTopReferrers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("email, name, referral_count, referral_code")
      .gt("referral_count", 0)
      .order("referral_count", { ascending: false })
      .limit(10);
    setTopReferrers(data || []);
  };

  const fetchTopContributors = async () => {
    const { data } = await supabase
      .from("leaderboard_scores")
      .select("email, display_name, total_xp, contribution_xp")
      .order("total_xp", { ascending: false })
      .limit(10);
    setTopContributors(data || []);
  };

  const fetchGrowth = async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    const [{ data: wData }, { data: cData }] = await Promise.all([
      supabase
        .from("waitlist_submissions")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: true }),
      supabase
        .from("contributions")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: true }),
    ]);

    const groupByDay = (rows: any[]): GrowthData[] => {
      const map: Record<string, number> = {};
      (rows || []).forEach((r) => {
        const day = new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        map[day] = (map[day] || 0) + 1;
      });
      return Object.entries(map).map(([date, count]) => ({ date, count }));
    };

    setRecentGrowth({
      waitlist: groupByDay(wData || []),
      contributions: groupByDay(cData || []),
    });
  };

  const fetchTopContributionUsers = async () => {
    const { data } = await supabase
      .from("contributions")
      .select("user_email, status");

    if (!data) return;

    const map: Record<string, { count: number; approved: number }> = {};
    data.forEach((r) => {
      if (!map[r.user_email]) map[r.user_email] = { count: 0, approved: 0 };
      map[r.user_email].count++;
      if (r.status === "approved") map[r.user_email].approved++;
    });

    const sorted = Object.entries(map)
      .map(([email, v]) => ({ email, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setTopContributionUsers(sorted);
  };

  const fetchRecentActivity = async () => {
    const { data } = await supabase
      .from("user_activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(15);
    setRecentActivity(data || []);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const s = stats!;

  const overviewCards = [
    { label: "Total Users", value: s.totalUsers, icon: Users, color: "text-primary" },
    { label: "Waitlist Signups", value: s.totalWaitlist, icon: UserCheck, color: "text-primary" },
    { label: "Validations", value: s.totalValidations, icon: Target, color: "text-amber-400" },
    { label: "Total XP Distributed", value: s.totalXPDistributed.toLocaleString(), icon: Zap, color: "text-purple-400" },
    { label: "Avg XP / User", value: s.avgXPPerUser, icon: TrendingUp, color: "text-blue-400" },
    { label: "Total Referrals", value: s.totalReferrals, icon: Share2, color: "text-pink-400" },
    { label: "Contributions", value: s.totalContributions, icon: BarChart3, color: "text-cyan-400" },
    { label: "Task Completions", value: s.totalTaskCompletions, icon: Award, color: "text-orange-400" },
  ];

  const contributionBreakdown = [
    { label: "Pending", value: s.pendingContributions, color: "text-yellow-400" },
    { label: "Approved", value: s.approvedContributions, color: "text-primary" },
    { label: "Rejected", value: s.rejectedContributions, color: "text-red-400" },
  ];

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform data insights and metrics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {overviewCards.map((card) => (
          <Card key={card.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{card.label}</span>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contribution Status Breakdown */}
      <Card className="bg-card border-border mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Contribution Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {contributionBreakdown.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color.replace("text-", "bg-")}`} />
                <span className="text-sm text-muted-foreground">{item.label}:</span>
                <span className="text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
          {s.totalContributions > 0 && (
            <div className="mt-3 flex h-3 rounded-full overflow-hidden bg-muted">
              {s.approvedContributions > 0 && (
                <div
                  className="bg-primary h-full"
                  style={{ width: `${(s.approvedContributions / s.totalContributions) * 100}%` }}
                />
              )}
              {s.pendingContributions > 0 && (
                <div
                  className="bg-yellow-500 h-full"
                  style={{ width: `${(s.pendingContributions / s.totalContributions) * 100}%` }}
                />
              )}
              {s.rejectedContributions > 0 && (
                <div
                  className="bg-destructive h-full"
                  style={{ width: `${(s.rejectedContributions / s.totalContributions) * 100}%` }}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="referrers" className="space-y-4 w-full min-w-0">
        <TabsList className="flex w-full min-w-0 flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="referrers" className="text-xs">Referrers</TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-xs">Top XP</TabsTrigger>
          <TabsTrigger value="posters" className="text-xs">Posters</TabsTrigger>
          <TabsTrigger value="growth" className="text-xs">Growth</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
        </TabsList>

        {/* Top Referrers */}
        <TabsContent value="referrers">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Share2 className="w-4 h-4 text-pink-400" /> Top 10 Referrers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topReferrers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No referrals yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead className="text-right">Referrals</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topReferrers.map((r, i) => (
                      <TableRow key={r.email}>
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-foreground">{r.name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{r.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{r.referral_code}</TableCell>
                        <TableCell className="text-right font-semibold text-primary">{r.referral_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top XP */}
        <TabsContent value="leaderboard">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" /> Top 10 by XP
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topContributors.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Contribution XP</TableHead>
                      <TableHead className="text-right">Total XP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topContributors.map((c, i) => (
                      <TableRow key={c.email}>
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-foreground">{c.display_name}</p>
                            <p className="text-xs text-muted-foreground">{c.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{c.contribution_xp}</TableCell>
                        <TableCell className="text-right font-semibold text-primary">{c.total_xp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Most Active Posters */}
        <TabsContent value="posters">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" /> Most Active Posters
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topContributionUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contributions yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Total Posts</TableHead>
                      <TableHead className="text-right">Approved</TableHead>
                      <TableHead className="text-right">Approval Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topContributionUsers.map((u, i) => (
                      <TableRow key={u.email}>
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell className="text-sm">{u.email}</TableCell>
                        <TableCell className="text-right">{u.count}</TableCell>
                        <TableCell className="text-right text-primary">{u.approved}</TableCell>
                        <TableCell className="text-right font-medium">
                          {u.count > 0 ? Math.round((u.approved / u.count) * 100) : 0}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Growth */}
        <TabsContent value="growth">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-primary" /> Waitlist Signups (30d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentGrowth.waitlist.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No signups in the last 30 days.</p>
                ) : (
                  <div className="space-y-1.5">
                    {recentGrowth.waitlist.map((d) => (
                      <div key={d.date} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{d.date}</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 bg-primary rounded-full"
                            style={{ width: `${Math.max(20, (d.count / Math.max(...recentGrowth.waitlist.map((x) => x.count))) * 120)}px` }}
                          />
                          <span className="text-foreground font-medium w-8 text-right">{d.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-cyan-400" /> Contributions (30d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentGrowth.contributions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No contributions in the last 30 days.</p>
                ) : (
                  <div className="space-y-1.5">
                    {recentGrowth.contributions.map((d) => (
                      <div key={d.date} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{d.date}</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 bg-cyan-500 rounded-full"
                            style={{ width: `${Math.max(20, (d.count / Math.max(...recentGrowth.contributions.map((x) => x.count))) * 120)}px` }}
                          />
                          <span className="text-foreground font-medium w-8 text-right">{d.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Activity */}
        <TabsContent value="activity">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" /> Recent Platform Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map((a) => (
                    <div key={a.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{a.user_email}</p>
                        <p className="text-xs text-muted-foreground">{a.description} · {a.activity_type}</p>
                      </div>
                      <div className="text-right ml-3 shrink-0">
                        <span className="text-sm font-semibold text-primary">+{a.points} XP</span>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
