import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Eye, X, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BATCH_SIZE = 30;

const INDIVIDUAL_LABELS: Record<string, string> = {
  web3_duration: "How long active in Web3",
  describes_you: "What best describes you",
  platforms: "Active platforms",
  projects_weekly: "Projects supported weekly",
  biggest_frustration: "Biggest frustration",
  experienced_issues: "Experienced issues",
  how_measured: "How contribution is measured",
  reputation_feeling: "Reputation feeling",
  auto_track_interest: "Auto-track interest",
  onchain_reputation: "On-chain reputation interest",
  what_matters: "What matters most",
  connect_wallet: "Would connect wallet",
  pool_participate: "Would participate in pools",
  pool_types: "Pool types of interest",
  contribution_style: "Contribution style",
  pay_analytics: "Would pay for analytics",
  use_weekly: "Would use weekly",
  trust_factor: "Trust factor",
  x_handle: "X Handle",
};

const PROJECT_LABELS: Record<string, string> = {
  project_name: "Project name",
  chain: "Chain",
  stage: "Stage",
  team_size: "Team size",
  growth_methods: "Growth methods",
  track_contributions: "Tracks contributions",
  measure_methods: "Measurement methods",
  know_top_contributors: "Knows top contributors",
  challenges: "Biggest challenges",
  trust_data: "Trusts engagement data",
  rewarded_blind: "Rewarded without knowing impact",
  platform_features: "Platform features wanted",
  metrics: "Metrics that matter",
  reputation_influence: "Reputation influences access",
  program_preference: "Program preference",
  pool_conditions: "Pool launch conditions",
  monthly_budget: "Monthly budget",
  integrate_30d: "Would integrate in 30 days",
  switch_reason: "What would make them switch",
};

const ValidationsManager = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState<any | null>(null);

  const fetchData = async (offset = 0, append = false) => {
    if (offset === 0) setLoading(true);
    else setLoadingMore(true);

    const { data, count } = await supabase
      .from("validation_submissions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + BATCH_SIZE - 1);

    const fetched = data || [];
    if (append) {
      setRows((prev) => [...prev, ...fetched]);
    } else {
      setRows(fetched);
    }
    setTotalCount(count || 0);
    setHasMore(fetched.length === BATCH_SIZE);
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleLoadMore = () => fetchData(rows.length, true);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("validation_submissions").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRows((prev) => prev.filter((r) => r.id !== id));
      setTotalCount((c) => c - 1);
      if (selected?.id === id) setSelected(null);
      toast({ title: "Deleted", description: "Entry removed." });
    }
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Role", "Points", "Created At"];
    const csv = [
      headers.join(","),
      ...rows.map((r) => [r.name, r.email, r.role, r.points_earned, r.created_at].join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "validations.csv";
    a.click();
  };

  const filtered = rows.filter(
    (r) =>
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderFormResponses = (row: any) => {
    const responses = row.form_responses;
    if (!responses || Object.keys(responses).length === 0) {
      return <p className="text-sm text-muted-foreground">No form responses recorded.</p>;
    }

    const labels = row.role === "project" ? PROJECT_LABELS : INDIVIDUAL_LABELS;

    return (
      <div className="space-y-3">
        {Object.entries(responses).map(([key, value]) => {
          if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) return null;
          const label = labels[key] || key;
          const display = Array.isArray(value) ? value.join(", ") : String(value);
          return (
            <div key={key}>
              <p className="text-muted-foreground text-xs">{label}</p>
              <p className="text-foreground text-sm">{display}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Validations</h1>
          <p className="text-muted-foreground text-sm mt-1">{totalCount} total submissions</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-1 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-transparent border-0 focus-visible:ring-0 h-10"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-muted-foreground font-medium">Name</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Email</th>
                <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">Role</th>
                <th className="text-left p-4 text-muted-foreground font-medium hidden lg:table-cell">Points</th>
                <th className="text-left p-4 text-muted-foreground font-medium hidden lg:table-cell">Created</th>
                <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No entries found.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border/30 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-foreground">{r.name}</td>
                    <td className="p-4 text-foreground">{r.email}</td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        r.role === "project" ? "bg-purple-500/10 text-purple-400" : "bg-primary/10 text-primary"
                      }`}>
                        {r.role === "project" ? "Project" : "Individual"}
                      </span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-primary font-medium">{r.points_earned}</span>
                    </td>
                    <td className="p-4 text-muted-foreground hidden lg:table-cell">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => setSelected(r)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(r.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Load more */}
        {hasMore && !search && !loading && (
          <div className="p-4 text-center border-t border-border/30">
            <Button variant="ghost" size="sm" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Load more
            </Button>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{selected.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selected.role === "project" ? "bg-purple-500/10 text-purple-400" : "bg-primary/10 text-primary"
                }`}>
                  {selected.role === "project" ? "Project / Founder" : "Community / Individual"}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm mb-4">
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="text-foreground">{selected.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Points Earned</p>
                <p className="text-foreground">{selected.points_earned}</p>
              </div>
              {selected.twitter_handle && (
                <div>
                  <p className="text-muted-foreground text-xs">X Handle</p>
                  <p className="text-foreground">@{selected.twitter_handle}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-xs">Submitted</p>
                <p className="text-foreground">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="border-t border-border/50 pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {selected.role === "project" ? "Project Questions" : "Individual Questions"}
              </h3>
              {renderFormResponses(selected)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationsManager;
