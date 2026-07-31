import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader, StatusPill } from "@/components/dashboard/Primitives";

type Row = {
  id: string;
  name: string | null;
  email: string;
  x_handle: string | null;
  reason: string | null;
  requested_role: string;
  status: string;
  code: string | null;
  expires_at: string | null;
  max_uses: number;
  uses_count: number;
  created_at: string;
};

const TABS = ["pending", "approved", "rejected", "redeemed"] as const;

const BetaRequestsManager = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof TABS)[number]>("pending");
  const [busy, setBusy] = useState<string | null>(null);
  const [days, setDays] = useState(14);
  const [maxUses, setMaxUses] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("beta_requests" as any)
      .select("*")
      .order("created_at", { ascending: false });
    setRows((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const act = async (id: string, action: "approve" | "reject") => {
    setBusy(id);
    const { data, error } = await supabase.functions.invoke("beta-approve", {
      body: { request_id: id, action, days_valid: days, max_uses: maxUses },
    });
    setBusy(null);
    if (error || (data as any)?.error) {
      toast({ title: "Action failed", description: (data as any)?.error ?? error?.message, variant: "destructive" });
      return;
    }
    toast({
      title: action === "approve" ? "Approved" : "Rejected",
      description: action === "approve"
        ? `Code ${(data as any)?.code} sent${(data as any)?.emailed ? "" : " (email failed — copy it manually)"}.`
        : "The request was rejected.",
    });
    load();
  };

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const list = rows.filter((r) => r.status === tab);

  return (
    <div>
      <PageHeader
        title="Beta Requests"
        subtitle="Approve contributors into the private beta and issue access codes."
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs px-3 py-1.5 rounded-full capitalize border transition-colors ${
              tab === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t} ({rows.filter((r) => r.status === t).length})
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span>Expiry (days)</span>
          <Input type="number" min={1} value={days} onChange={(e) => setDays(Number(e.target.value))} className="h-8 w-20" />
          <span>Max uses</span>
          <Input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(Number(e.target.value))} className="h-8 w-20" />
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : list.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">No {tab} requests.</p>
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {r.name || "Unnamed"}{" "}
                    <span className="text-xs font-normal text-muted-foreground">{r.email}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {r.requested_role?.replace("_", " ")}
                    {r.x_handle ? ` · @${r.x_handle}` : ""} · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusPill status={r.status} />
              </div>

              {r.reason && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{r.reason}</p>}

              {r.code && (
                <div className="mt-3 flex items-center gap-2">
                  <code className="text-xs font-mono px-2 py-1 rounded bg-muted text-foreground">{r.code}</code>
                  <button onClick={() => copy(r.code!)} className="text-muted-foreground hover:text-foreground">
                    {copied === r.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-[11px] text-muted-foreground">
                    {r.uses_count}/{r.max_uses} used
                    {r.expires_at ? ` · expires ${new Date(r.expires_at).toLocaleDateString()}` : ""}
                  </span>
                </div>
              )}

              {r.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" disabled={busy === r.id} onClick={() => act(r.id, "approve")}>
                    {busy === r.id && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}Approve & email code
                  </Button>
                  <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => act(r.id, "reject")}>
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BetaRequestsManager;
