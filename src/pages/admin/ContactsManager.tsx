import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Eye, X, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BATCH_SIZE = 30;

const ContactsManager = () => {
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
      .from("contact_submissions")
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
    const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRows((prev) => prev.filter((r) => r.id !== id));
      setTotalCount((c) => c - 1);
      if (selected?.id === id) setSelected(null);
      toast({ title: "Deleted", description: "Message removed." });
    }
  };

  const handleMarkRead = async (id: string) => {
    const { error } = await supabase.from("contact_submissions").update({ status: "read" }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "read" } : r)));
      if (selected?.id === id) setSelected({ ...selected, status: "read" });
    }
  };

  const filtered = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.subject.toLowerCase().includes(search.toLowerCase())
  );

  const newCount = rows.filter((r) => r.status === "new").length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contact Messages</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalCount} total{newCount > 0 && <span className="text-primary ml-1">({newCount} new)</span>}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-1 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
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
                <th className="text-left p-4 text-muted-foreground font-medium">Subject</th>
                <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">Status</th>
                <th className="text-left p-4 text-muted-foreground font-medium hidden lg:table-cell">Date</th>
                <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No messages found.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border/30 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-foreground">{r.name}</td>
                    <td className="p-4 text-foreground">{r.subject}</td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        r.status === "new" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground hidden lg:table-cell">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => setSelected(r)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {r.status === "new" && (
                        <Button variant="ghost" size="icon" className="text-green-400" onClick={() => handleMarkRead(r.id)}>
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
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
          <div className="glass-card rounded-xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">{selected.subject}</h2>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">From</p>
                <p className="text-foreground">{selected.name} ({selected.email})</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Date</p>
                <p className="text-foreground">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Message</p>
                <p className="text-foreground whitespace-pre-wrap">{selected.message}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              {selected.status === "new" && (
                <Button size="sm" variant="outline" onClick={() => handleMarkRead(selected.id)}>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Read
                </Button>
              )}
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

export default ContactsManager;
