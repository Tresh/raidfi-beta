import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader, StatusPill } from "@/components/dashboard/Primitives";

type Row = {
  id: string;
  user_email: string;
  kind: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

const TABS = ["open", "in_progress", "resolved"] as const;

const ReportsManager = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof TABS)[number]>("open");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("feedback_reports" as any)
      .select("*")
      .order("created_at", { ascending: false });
    setRows((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    setBusy(id);
    const { error } = await supabase.from("feedback_reports" as any).update({ status }).eq("id", id);
    setBusy(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const list = rows.filter((r) => r.status === tab);

  return (
    <div>
      <PageHeader title="Reports & Feedback" subtitle="Bug reports and feedback submitted from contributor dashboards." />

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs px-3 py-1.5 rounded-full capitalize border transition-colors ${
              tab === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.replace("_", " ")} ({rows.filter((r) => r.status === t).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : list.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">Nothing here.</p>
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-foreground">{r.subject}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {r.kind} · {r.user_email} · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusPill status={r.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">{r.message}</p>
              <div className="mt-3 flex gap-2">
                {r.status !== "in_progress" && (
                  <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => setStatus(r.id, "in_progress")}>
                    Mark in progress
                  </Button>
                )}
                {r.status !== "resolved" && (
                  <Button size="sm" disabled={busy === r.id} onClick={() => setStatus(r.id, "resolved")}>
                    Resolve
                  </Button>
                )}
                {r.status !== "open" && (
                  <Button size="sm" variant="ghost" disabled={busy === r.id} onClick={() => setStatus(r.id, "open")}>
                    Reopen
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsManager;
