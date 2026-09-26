import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader, StatusPill } from "@/components/dashboard/Primitives";

type Row = {
  id: string;
  project_name: string;
  website: string | null;
  x_handle: string | null;
  telegram: string | null;
  discord: string | null;
  founder_name: string;
  email: string;
  why: string | null;
  goal?: string | null;
  expectations?: string | null;
  request_types?: string[];
  investment_ready?: boolean | null;
  estimated_budget?: string | null;
  telegram_group_id?: string | null;
  logo_data_url?: string | null;
  status: string;
  created_at: string;
};

const TABS = ["pending", "approved", "rejected"] as const;

const ProjectRequestsManager = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof TABS)[number]>("pending");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("project_requests" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load project requests", description: error.message, variant: "destructive" });
    }
    setRows((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const act = async (id: string, action: "approve" | "reject") => {
    setBusy(id);
    const { data, error } = await supabase.functions.invoke("project-approve", {
      body: { request_id: id, action },
    });
    setBusy(null);
    if (error || (data as any)?.error) {
      toast({ title: "Action failed", description: (data as any)?.error ?? error?.message, variant: "destructive" });
      return;
    }
    const res = data as any;
    if (action === "approve" && res?.emailed === false) {
      toast({
        title: "Approved, but the email failed",
        description: `Workspace created. Share the code manually: ${res?.code ?? ""}. ${res?.emailError ?? ""}`.trim(),
        variant: "destructive",
      });
      load();
      return;
    }
    toast({
      title: action === "approve" ? "Project approved" : "Request rejected",
      description: action === "approve"
        ? `Workspace created. Access code ${res?.code ?? ""} emailed to the founder.`
        : "The founder was not notified.",
    });
    load();
  };

  const list = rows.filter((r) => r.status === tab);

  return (
    <div>
      <PageHeader title="Project Requests" subtitle="Review projects applying for a RaidFi workspace." />

      <div className="flex flex-wrap gap-2 mb-4">
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
                <div>
                  {r.logo_data_url && <img src={r.logo_data_url} alt="" className="w-10 h-10 rounded-md object-cover border border-border mb-2" />}
                  <p className="text-sm font-semibold text-foreground">{r.project_name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {r.founder_name} · {r.email} · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusPill status={r.status} />
              </div>

              {!!r.request_types?.length && <p className="text-[11px] text-primary mt-2">{r.request_types.map((item) => item.replace(/_/g, " ")).join(" · ")}</p>}
              {r.goal && <p className="text-xs text-foreground mt-2"><span className="font-medium">Goal:</span> {r.goal}</p>}
              {r.expectations && <p className="text-xs text-muted-foreground mt-1"><span className="font-medium text-foreground">Expected:</span> {r.expectations}</p>}
              {(r.investment_ready !== null || r.estimated_budget) && <p className="text-[11px] text-muted-foreground mt-2">Investment: {r.investment_ready === true ? "Open" : r.investment_ready === false ? "Not currently" : "Discuss"}{r.estimated_budget ? ` · ${r.estimated_budget}` : ""}</p>}
              {r.telegram_group_id && <p className="text-[11px] text-muted-foreground mt-1">Telegram group ID: {r.telegram_group_id}</p>}

              <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-muted-foreground">
                {r.website && (
                  <a href={r.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
                    Website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {r.x_handle && <span>@{r.x_handle}</span>}
                {r.telegram && <span>{r.telegram}</span>}
                {r.discord && <span>{r.discord}</span>}
              </div>

              {r.why && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{r.why}</p>}
              {(r as any).referred_by && <p className="text-[11px] text-primary mt-1">Referred by {(r as any).referred_by}</p>}

              {r.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" disabled={busy === r.id} onClick={() => act(r.id, "approve")}>
                    {busy === r.id && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}Approve & create workspace
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

export default ProjectRequestsManager;
