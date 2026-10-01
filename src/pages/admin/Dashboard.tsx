import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Users, Building2, KeyRound, MessageSquareWarning, Mail, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Stats {
  contributorCount: number;
  projectCount: number;
  pendingProjectRequests: number;
  pendingContributions: number;
  totalContributions: number;
  pendingBetaRequests: number;
  newContactCount: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    contributorCount: 0,
    projectCount: 0,
    pendingProjectRequests: 0,
    pendingContributions: 0,
    totalContributions: 0,
    pendingBetaRequests: 0,
    newContactCount: 0,
  });

  const [recentContributions, setRecentContributions] = useState<any[]>([]);
  const [recentProjectRequests, setRecentProjectRequests] = useState<any[]>([]);
  const [recentBetaRequests, setRecentBetaRequests] = useState<any[]>([]);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const [
        contributorsRes,
        projectsRes,
        projectRequestsPendingRes,
        projectRequestsRecentRes,
        contributionsPendingRes,
        contributionsTotalRes,
        contributionsRecentRes,
        betaPendingRes,
        betaRecentRes,
        contactsNewRes,
        contactsRecentRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("projects" as any).select("id", { count: "exact", head: true }),
        supabase.from("project_requests" as any).select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("project_requests" as any).select("id, project_name, founder_name, email, status, created_at").order("created_at", { ascending: false }).limit(4),
        supabase.from("contributions").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("contributions").select("id", { count: "exact", head: true }),
        supabase.from("contributions").select("id, user_email, content_type, status, points_earned, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("beta_requests" as any).select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("beta_requests" as any).select("id, name, email, requested_role, status, created_at").order("created_at", { ascending: false }).limit(4),
        supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("contact_submissions").select("id, name, subject, status, created_at").order("created_at", { ascending: false }).limit(4),
      ]);

      setStats({
        contributorCount: contributorsRes.count || 0,
        projectCount: projectsRes.count || 0,
        pendingProjectRequests: projectRequestsPendingRes.count || 0,
        pendingContributions: contributionsPendingRes.count || 0,
        totalContributions: contributionsTotalRes.count || 0,
        pendingBetaRequests: betaPendingRes.count || 0,
        newContactCount: contactsNewRes.count || 0,
      });

      setRecentContributions(contributionsRecentRes.data || []);
      setRecentProjectRequests(projectRequestsRecentRes.data || []);
      setRecentBetaRequests(betaRecentRes.data || []);
      setRecentContacts(contactsRecentRes.data || []);
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const cards = [
    {
      label: "Contributors",
      value: stats.contributorCount,
      subText: "Registered accounts",
      icon: Users,
      color: "text-primary",
      link: "/admin/contributors",
    },
    {
      label: "Projects & Workspaces",
      value: stats.projectCount,
      subText: `${stats.pendingProjectRequests} pending request${stats.pendingProjectRequests === 1 ? "" : "s"}`,
      icon: Building2,
      color: "text-blue-400",
      link: "/admin/projects",
      highlight: stats.pendingProjectRequests > 0,
    },
    {
      label: "Contributions",
      value: stats.totalContributions,
      subText: `${stats.pendingContributions} pending review`,
      icon: MessageSquareWarning,
      color: "text-amber-400",
      link: "/admin/contributions",
      highlight: stats.pendingContributions > 0,
    },
    {
      label: "Beta Access Requests",
      value: `${stats.pendingBetaRequests} Pending`,
      subText: "Private beta queue",
      icon: KeyRound,
      color: "text-purple-400",
      link: "/admin/beta",
      highlight: stats.pendingBetaRequests > 0,
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overview Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Live status of RaidFi contributors, projects, and contributions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/admin/analytics">View Detailed Analytics</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors block relative group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-3xl font-bold text-foreground">{card.value}</p>
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs ${card.highlight ? "text-amber-500 font-medium" : "text-muted-foreground"}`}>
                {card.subText}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Contributions */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground text-base flex items-center gap-2">
              <MessageSquareWarning className="w-4 h-4 text-amber-400" /> Recent Contributions
            </h2>
            <Link to="/admin/contributions" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Loading contributions...</p>
          ) : recentContributions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No contributions submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {recentContributions.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm text-foreground truncate">{c.user_email}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">
                      {c.content_type || "post"} · {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${
                      c.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-medium"
                        : c.status === "approved"
                        ? "bg-primary/15 text-primary"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Project Requests */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" /> Project Workspace Applications
            </h2>
            <Link to="/admin/projects" className="text-xs text-primary hover:underline flex items-center gap-1">
              Manage requests <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Loading project requests...</p>
          ) : recentProjectRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No project requests yet.</p>
          ) : (
            <div className="space-y-3">
              {recentProjectRequests.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-medium text-foreground truncate">{p.project_name}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      by {p.founder_name} ({p.email})
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${
                      p.status === "pending"
                        ? "bg-amber-500/20 text-amber-500 font-medium"
                        : p.status === "approved"
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Beta Access Requests */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-400" /> Beta Access Requests
            </h2>
            <Link to="/admin/beta" className="text-xs text-primary hover:underline flex items-center gap-1">
              View queue <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Loading beta requests...</p>
          ) : recentBetaRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No beta requests pending.</p>
          ) : (
            <div className="space-y-3">
              {recentBetaRequests.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm text-foreground truncate">{b.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {b.name || "Unnamed"} · {new Date(b.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${
                      b.status === "pending"
                        ? "bg-purple-500/20 text-purple-400 font-medium"
                        : b.status === "approved" || b.status === "redeemed"
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {b.status || "pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Contact Messages */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-400" /> Recent Contact Messages
            </h2>
            <Link to="/admin/contacts" className="text-xs text-primary hover:underline flex items-center gap-1">
              Manage contacts <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Loading contact messages...</p>
          ) : recentContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No contact messages yet.</p>
          ) : (
            <div className="space-y-3">
              {recentContacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm text-foreground truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{c.subject}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${
                      c.status === "new" ? "bg-green-500/20 text-green-400 font-medium" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
