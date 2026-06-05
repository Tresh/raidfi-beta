import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Search, Eye, X, Download, Loader2, ExternalLink, Check, XCircle, Star, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const BATCH_SIZE = 30;

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" },
    approved: { label: "Approved", cls: "bg-primary/15 text-primary" },
    rejected: { label: "Rejected", cls: "bg-destructive/20 text-destructive" },
  };
  const s = map[status] || { label: status, cls: "bg-muted text-muted-foreground" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
};

const ContributionsManager = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [contentTypes, setContentTypes] = useState<{ value: string; label: string }[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState<any | null>(null);
  const [scoreInput, setScoreInput] = useState<string>("");
  const [notesInput, setNotesInput] = useState<string>("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<{ title: string; desc: string; label: string; variant: "destructive" | "default"; action: () => void }>({
    title: "", desc: "", label: "Confirm", variant: "destructive", action: () => {},
  });

  const askConfirm = (title: string, desc: string, label: string, variant: "destructive" | "default", action: () => void) => {
    setConfirmData({ title, desc, label, variant, action });
    setConfirmOpen(true);
  };

  const fetchTypes = async () => {
    const { data } = await supabase.from("content_types" as any).select("value,label").eq("is_active", true).order("sort_order");
    setContentTypes((data as any) || []);
  };

  const fetchData = async (offset = 0, append = false) => {
    if (offset === 0) setLoading(true); else setLoadingMore(true);
    let query = supabase
      .from("contributions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + BATCH_SIZE - 1);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data, count } = await query;
    const fetched = data || [];
    if (append) setRows(prev => [...prev, ...fetched]); else setRows(fetched);
    setTotalCount(count || 0);
    setHasMore(fetched.length === BATCH_SIZE);
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => { fetchTypes(); }, []);
  useEffect(() => { fetchData(); }, [statusFilter]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("contributions").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      setRows(prev => prev.filter(r => r.id !== id));
      setTotalCount(c => c - 1);
      if (selected?.id === id) setSelected(null);
      toast({ title: "Deleted" });
    }
  };

  const handleApprove = async (row: any, manualScore: number | null, notes?: string) => {
    const points = manualScore != null ? manualScore : (row.points_earned || 10);
    const patch: any = { status: "approved", manual_score: manualScore, points_earned: points, published_to_feed: true };
    if (notes !== undefined) patch.admin_notes = notes;
    const { error } = await supabase.from("contributions").update(patch).eq("id", row.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      setRows(prev => prev.map(r => r.id === row.id ? { ...r, ...patch } : r));
      if (selected?.id === row.id) setSelected({ ...selected, ...patch });
      toast({ title: "Approved ✅", description: `Awarded ${points} XP.` });
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from("contributions").update({ status: "rejected" }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      setRows(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" } : r));
      if (selected?.id === id) setSelected({ ...selected, status: "rejected" });
      toast({ title: "Rejected ❌" });
    }
  };

  const togglePublish = async (row: any) => {
    const newVal = !row.published_to_feed;
    const { error } = await supabase.from("contributions").update({ published_to_feed: newVal }).eq("id", row.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      setRows(prev => prev.map(r => r.id === row.id ? { ...r, published_to_feed: newVal } : r));
      if (selected?.id === row.id) setSelected({ ...selected, published_to_feed: newVal });
    }
  };

  const updateContentType = async (id: string, value: string) => {
    const { error } = await supabase.from("contributions").update({ content_type: value }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setRows(prev => prev.map(r => r.id === id ? { ...r, content_type: value } : r));
  };

  const fetchPostText = async (row: any) => {
    toast({ title: "Fetching text...", description: "via Twitter oEmbed" });
    const { error } = await supabase.functions.invoke("fetch-post-text", {
      body: { contribution_id: row.id, post_url: row.post_url },
    });
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else {
      const { data } = await supabase.from("contributions").select("post_text,post_author,post_fetched_at").eq("id", row.id).single();
      if (data) {
        setRows(prev => prev.map(r => r.id === row.id ? { ...r, ...data } : r));
        if (selected?.id === row.id) setSelected({ ...selected, ...data });
      }
      toast({ title: "Done" });
    }
  };

  const handleExportCSV = () => {
    const headers = ["Email", "Post URL", "Type", "Points", "Status", "Manual Score", "AI Score", "Created At"];
    const csv = [
      headers.join(","),
      ...rows.map(r => [r.user_email, `"${r.post_url}"`, r.content_type || "post", r.points_earned, r.status,
        r.manual_score ?? "", r.ai_score ?? "", r.created_at].join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "contributions.csv";
    a.click();
  };

  const openDetail = (r: any) => {
    setSelected(r);
    setScoreInput(r.manual_score?.toString() ?? "");
    setNotesInput(r.admin_notes ?? "");
  };

  const filtered = rows.filter(r =>
    r.user_email.toLowerCase().includes(search.toLowerCase()) ||
    r.post_url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contributions</h1>
          <p className="text-muted-foreground text-sm mt-1">{totalCount} {statusFilter !== "all" ? statusFilter : "total"} contributions</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="flex gap-1 mb-4 flex-wrap">
        {(["pending", "all", "approved", "rejected"] as StatusFilter[]).map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              statusFilter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-1 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by email or URL..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-transparent border-0 focus-visible:ring-0 h-10" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-3 text-muted-foreground font-medium">User</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Type</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Score</th>
                <th className="text-left p-3 text-muted-foreground font-medium hidden md:table-cell">Feed</th>
                <th className="text-left p-3 text-muted-foreground font-medium hidden lg:table-cell">Date</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No contributions.</td></tr>
              ) : (
                filtered.map(r => {
                  const score = r.manual_score ?? r.ai_score;
                  return (
                    <tr key={r.id} className="border-b border-border/30 hover:bg-white/[0.02]">
                      <td className="p-3 text-foreground text-xs">{r.user_email}</td>
                      <td className="p-3">
                        <select value={r.content_type || "post"} onChange={(e) => updateContentType(r.id, e.target.value)}
                          className="h-7 text-xs rounded-md border border-input bg-background px-1.5">
                          {contentTypes.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                        </select>
                      </td>
                      <td className="p-3">{statusBadge(r.status)}</td>
                      <td className="p-3">
                        {score != null ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${score > 10 ? "text-primary" : "text-muted-foreground"}`}>
                            {score > 10 && <Star className="w-3 h-3 fill-current" />}
                            {score}
                          </span>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <Switch checked={!!r.published_to_feed} onCheckedChange={() => togglePublish(r)} />
                      </td>
                      <td className="p-3 text-muted-foreground hidden lg:table-cell text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-0.5">
                          {r.status === "pending" && (
                            <>
                              <Button variant="ghost" size="icon" className="text-primary h-8 w-8"
                                onClick={() => askConfirm("Approve", `Approve from ${r.user_email}?`, "Approve", "default", () => handleApprove(r, r.manual_score))}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8"
                                onClick={() => askConfirm("Reject", `Reject from ${r.user_email}?`, "Reject", "destructive", () => handleReject(r.id))}>
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(r)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive h-8 w-8"
                            onClick={() => askConfirm("Delete contribution", `Permanently delete from ${r.user_email}?`, "Delete", "destructive", () => handleDelete(r.id))}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {hasMore && !search && !loading && (
          <div className="p-4 text-center border-t border-border/30">
            <Button variant="ghost" size="sm" onClick={() => fetchData(rows.length, true)} disabled={loadingMore}>
              {loadingMore && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Load more
            </Button>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelected(null)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Contribution Details</h2>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-muted-foreground text-xs mb-0.5">Email</p><p className="text-foreground break-all">{selected.user_email}</p></div>
                <div><p className="text-muted-foreground text-xs mb-0.5">Status</p>{statusBadge(selected.status)}</div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Post URL</p>
                <a href={selected.post_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 break-all">
                  {selected.post_url} <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Content type</p>
                  <select value={selected.content_type || "post"} onChange={(e) => updateContentType(selected.id, e.target.value)}
                    className="w-full h-9 text-sm rounded-md border border-input bg-background px-2">
                    {contentTypes.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                  </select>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs mb-1">Published to feed</p>
                    <Switch checked={!!selected.published_to_feed} onCheckedChange={() => togglePublish(selected)} />
                  </div>
                </div>
              </div>

              {/* Scoring */}
              <div className="p-3 rounded-lg border border-border space-y-2">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Scoring</p>
                <div className="flex items-center gap-2">
                  <Input type="number" min={0} max={100} placeholder="Manual score (0-100)"
                    value={scoreInput} onChange={(e) => setScoreInput(e.target.value)} className="h-9 text-sm" />
                  <Button size="sm" variant="outline"
                    onClick={() => {
                      const n = scoreInput === "" ? null : parseInt(scoreInput);
                      askConfirm("Save score", `Set manual score to ${n ?? "none"}?`, "Save", "default", async () => {
                        const { error } = await supabase.from("contributions").update({ manual_score: n }).eq("id", selected.id);
                        if (!error) {
                          setRows(prev => prev.map(r => r.id === selected.id ? { ...r, manual_score: n } : r));
                          setSelected({ ...selected, manual_score: n });
                          toast({ title: "Score saved" });
                        }
                      });
                    }}>Save score</Button>
                </div>
                {selected.ai_score != null && <p className="text-[11px] text-muted-foreground">AI score: {selected.ai_score}{selected.ai_feedback ? ` — ${selected.ai_feedback}` : ""}</p>}
              </div>

              {/* Post text */}
              <div className="p-3 rounded-lg border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Post text</p>
                  <Button size="sm" variant="ghost" onClick={() => fetchPostText(selected)}>
                    <FileText className="w-3.5 h-3.5 mr-1" /> {selected.post_text ? "Refresh" : "Fetch"}
                  </Button>
                </div>
                {selected.post_text ? (
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selected.post_text}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Not fetched yet.</p>
                )}
                {selected.post_author && <p className="text-[11px] text-muted-foreground">Author: @{selected.post_author}</p>}
              </div>

              {/* Notes */}
              <div>
                <p className="text-muted-foreground text-xs mb-1">Admin notes</p>
                <Textarea value={notesInput} onChange={(e) => setNotesInput(e.target.value)} className="text-sm" rows={2} />
              </div>
            </div>
            <div className="mt-6 flex gap-2 flex-wrap">
              {selected.status === "pending" && (
                <>
                  <Button size="sm" className="bg-primary"
                    onClick={() => askConfirm("Approve", "Approve this contribution?", "Approve", "default", () => {
                      const n = scoreInput === "" ? null : parseInt(scoreInput);
                      handleApprove(selected, n, notesInput);
                    })}>
                    <Check className="w-4 h-4 mr-2" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive"
                    onClick={() => askConfirm("Reject", "Reject this contribution?", "Reject", "destructive", () => handleReject(selected.id))}>
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </>
              )}
              <Button size="sm" variant="outline" className="text-destructive ml-auto"
                onClick={() => askConfirm("Delete contribution", "Permanently delete? Cannot be undone.", "Delete", "destructive", () => handleDelete(selected.id))}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmData.title}
        description={confirmData.desc}
        confirmLabel={confirmData.label}
        variant={confirmData.variant}
        onConfirm={confirmData.action}
      />
    </div>
  );
};

export default ContributionsManager;
