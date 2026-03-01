import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WaitlistManager = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("waitlist_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast({
        title: "Error loading waitlist",
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
    if (!confirm("Delete this waitlist entry?")) return;

    const { error } = await supabase.from("waitlist_submissions").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Deleted", description: "Entry removed." });
    }
  };

  const handleExportCSV = () => {
    const headers = ["Email", "Points", "User ID", "Created At"];

    const escape = (value: any) => `"${String(value ?? "").replace(/"/g, '""')}"`;

    const filteredRows = rows.filter((r) => (r.email || "").toLowerCase().includes(search.toLowerCase()));

    const csv = [
      headers.join(","),
      ...filteredRows.map((r) =>
        [escape(r.email), escape(r.points), escape(r.user_id), escape(r.created_at)].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "waitlist.csv";
    a.click();
  };

  const filtered = rows.filter((r) => (r.email || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Waitlist</h1>
          <p className="text-muted-foreground text-sm mt-1">{rows.length} total signups</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="glass-card rounded-xl p-1 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-transparent border-0 focus-visible:ring-0 h-10"
          />
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden h-[65vh] flex flex-col">
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background z-10">
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-muted-foreground font-medium">Email</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Points</th>
                  <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">Created</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      No entries found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-b border-border/30 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-foreground">{r.email}</td>
                      <td className="p-4">
                        <span className="text-primary font-medium">{r.points}</span>
                      </td>
                      <td className="p-4 text-muted-foreground hidden md:table-cell">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
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
      </div>
    </div>
  );
};

export default WaitlistManager;
