import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Eye, X, Download, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BATCH_SIZE = 30;

const ContributionsManager = () => {
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
      .from("contributions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + BATCH_SIZE - 1);

    const fetched = data || [];
    if (append) setRows((prev) => [...prev, ...fetched]);
    else setRows(fetched);
    setTotalCount(count || 0);
    setHasMore(fetched.length === BATCH_SIZE);
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleLoadMore = () => fetchData(rows.length, true);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("contributions").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRows((prev) => prev.filter((r) => r.id !== id));
      setTotalCount((c) => c - 1);
      if (selected?.id === id) setSelected(null);
      toast({ title: "Deleted", description: "Contribution removed." });
    }
  };

  const handleExportCSV = () => {
    const headers = ["Email", "Post URL", "Points", "AI Score", "AI Feedback", "Engagements", "Created At"];
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        [r.user_email, `"${r.post_url}"`, r.points_earned, r.ai_score, `"${(r.ai_feedback || '').replace(/"/g, '""')}"`, r.engagement_count, r.created_at].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contributions.csv";
    a.click();
  };

  const filtered = rows.filter(
    (r) =>
      r.user_email.toLowerCase().includes(search.toLowerCase()) ||
      r.post_url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contributions</h1>
          <p className="text-muted-foreground text-sm mt-1">{totalCount} total contributions</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-1 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or URL..."
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
                <th className="text-left p-4 text-muted-foreground font-medium">Email</th>
                <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">Points</th>
                <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">AI Feedback</th>
                <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">Engagements</th>
                <th className="text-left p-4 text-muted-foreground font-medium hidden lg:table-cell">Date</th>
                <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No contributions found.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border/30 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-foreground">{r.user_email}</td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-primary font-medium">{r.points_earned}</span>
                    </td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{r.engagement_count}</td>
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
          <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Contribution Details</h2>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="text-foreground">{selected.user_email}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Post URL</p>
                <a href={selected.post_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                  {selected.post_url} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-muted-foreground text-xs">Points</p>
                  <p className="text-primary font-semibold">{selected.points_earned}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Engagements</p>
                  <p className="text-foreground">{selected.engagement_count}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Date</p>
                <p className="text-foreground">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-6">
              <Button size="sm" variant="destructive" onClick={() => handleDelete(selected.id)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributionsManager;
