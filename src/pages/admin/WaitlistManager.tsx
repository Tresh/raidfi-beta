import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const BATCH_SIZE = 30;

const WaitlistManager = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string } | null>(null);

  const fetchData = async (offset = 0, append = false) => {
    if (offset === 0) setLoading(true);
    else setLoadingMore(true);

    const { data, count } = await supabase
      .from("waitlist_submissions")
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("waitlist_submissions").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setTotalCount((c) => c - 1);
      toast({ title: "Deleted", description: "Entry removed." });
    }
    setDeleteTarget(null);
  };

  const handleExportCSV = () => {
    const headers = ["Email", "Points", "User ID", "Created At"];
    const csv = [
      headers.join(","),
      ...rows.map((r) => [r.email, r.points, r.user_id || "", r.created_at].join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "waitlist.csv";
    a.click();
  };

  const filtered = rows.filter((r) => r.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Waitlist</h1>
          <p className="text-muted-foreground text-sm mt-1">{totalCount} total signups</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-1 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-transparent border-0 focus-visible:ring-0 h-10" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-muted-foreground font-medium">Email</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Points</th>
                <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">Created</th>
                <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No entries found.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border/30 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-foreground">{r.email}</td>
                    <td className="p-4"><span className="text-primary font-medium">{r.points}</span></td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"
                        onClick={() => { setDeleteTarget({ id: r.id, email: r.email }); setConfirmOpen(true); }}>
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
              {loadingMore && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Load more
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Waitlist Entry"
        description={`Permanently delete the waitlist entry for ${deleteTarget?.email || "this user"}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default WaitlistManager;
