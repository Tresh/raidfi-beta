import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Eye, X, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ValidationsManager = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("validation_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast({
        title: "Error loading validations",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setRows(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this validation entry?")) return;

    const { error } = await supabase.from("validation_submissions").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Deleted", description: "Entry removed." });
    }
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Role", "Points", "Created At"];

    const escape = (value: any) => `"${String(value ?? "").replace(/"/g, '""')}"`;

    const filteredRows = rows.filter(
      (r) =>
        (r.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.name || "").toLowerCase().includes(search.toLowerCase()),
    );

    const csv = [
      headers.join(","),
      ...filteredRows.map((r) =>
        [escape(r.name), escape(r.email), escape(r.role), escape(r.points_earned), escape(r.created_at)].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "validations.csv";
    a.click();
  };

  const filtered = rows.filter(
    (r) =>
      (r.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Validations</h1>
          <p className="text-muted-foreground text-sm mt-1">{rows.length} total submissions</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="glass-card rounded-xl p-1 mb-4">
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

      <div className="glass-card rounded-xl overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background z-10">
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
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No entries found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border/30 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-foreground">{r.name}</td>
                    <td className="p-4 text-foreground">{r.email}</td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">{r.role}</td>
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
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="glass-card rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {[
                ["Email", selected.email],
                ["Role", selected.role],
                ["Points", selected.points_earned],
                ["Twitter", selected.twitter_handle],
                ["Telegram", selected.telegram_handle],
                ["Project", selected.project_name],
                ["Description", selected.project_description],
                ["Website", selected.project_website],
                ["Budget", selected.expected_budget],
                ["Experience", selected.experience],
                ["Why Interested", selected.why_interested],
              ].map(([label, value]) =>
                value ? (
                  <div key={label as string}>
                    <p className="text-muted-foreground text-xs">{label}</p>
                    <p className="text-foreground">{String(value)}</p>
                  </div>
                ) : null,
              )}

              {selected.form_responses && Object.keys(selected.form_responses).length > 0 && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Form Responses</p>
                  <pre className="bg-card rounded-lg p-3 text-xs text-foreground overflow-x-auto">
                    {JSON.stringify(selected.form_responses, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationsManager;
