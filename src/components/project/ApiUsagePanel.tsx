import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Panel } from "@/components/dashboard/Primitives";
import { Button } from "@/components/ui/button";

type Log = { id: number; api_key_id: string | null; endpoint: string; method: string; status_code: number; response_time_ms: number; rate_limited: boolean; created_at: string };

export default function ApiUsagePanel({ projectId, keyNames }: { projectId: string; keyNames: Record<string, string> }) {
  const [range, setRange] = useState<1 | 7 | 30>(1);
  const [logs, setLogs] = useState<Log[]>([]);
  const load = async () => {
    const since = new Date(Date.now() - range * 864e5).toISOString();
    const { data } = await supabase.from("project_api_logs").select("id,api_key_id,endpoint,method,status_code,response_time_ms,rate_limited,created_at")
      .eq("project_id", projectId).gte("created_at", since).order("created_at", { ascending: false }).limit(1000);
    setLogs((data as Log[]) ?? []);
  };
  useEffect(() => { load(); }, [projectId, range]);

  const s = useMemo(() => {
    const total = logs.length, errors = logs.filter((l) => l.status_code >= 400 && !l.rate_limited).length;
    const limited = logs.filter((l) => l.rate_limited).length;
    const avg = total ? Math.round(logs.reduce((a, l) => a + l.response_time_ms, 0) / total) : 0;
    const byKey: Record<string, number> = {};
    logs.forEach((l) => { const k = l.api_key_id ?? "—"; byKey[k] = (byKey[k] ?? 0) + 1; });
    return { total, errors, limited, avg, errRate: total ? Math.round((errors / total) * 1000) / 10 : 0, byKey: Object.entries(byKey).sort((a, b) => b[1] - a[1]) };
  }, [logs]);

  const badge = (l: Log) => l.rate_limited ? "bg-accent/20 text-accent-foreground" : l.status_code < 400 ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive";

  return (
    <Panel title="API usage">
      <div className="space-y-4 text-sm">
        <div className="flex flex-wrap gap-2 items-center">
          {([1, 7, 30] as const).map((r) => (
            <Button key={r} size="sm" variant={range === r ? "default" : "outline"} onClick={() => setRange(r)}>{r === 1 ? "24h" : `${r}d`}</Button>
          ))}
          <Button size="sm" variant="ghost" onClick={load}>Refresh</Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[["Requests", s.total], ["Error rate", `${s.errRate}%`], ["Rate-limited", s.limited], ["Avg latency", `${s.avg}ms`]].map(([k, v]) => (
            <div key={k as string} className="rounded-md border border-border p-3"><p className="text-[11px] text-muted-foreground">{k}</p><p className="text-lg font-semibold">{v}</p></div>
          ))}
        </div>
        <div>
          <p className="text-xs font-medium mb-1">Usage by key</p>
          {s.byKey.length === 0 && <p className="text-xs text-muted-foreground">No requests yet.</p>}
          {s.byKey.map(([id, n]) => (
            <div key={id} className="mb-1">
              <div className="flex justify-between text-xs"><span className="truncate">{keyNames[id] ?? "Deleted key"}</span><span>{n}</span></div>
              <div className="h-1.5 rounded bg-muted"><div className="h-1.5 rounded bg-primary" style={{ width: `${(n / s.total) * 100}%` }} /></div>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-medium mb-1">Recent requests</p>
          <div className="max-h-72 overflow-auto divide-y divide-border">
            {logs.slice(0, 50).map((l) => (
              <div key={l.id} className="py-1.5 flex items-center gap-2 text-[11px] font-mono">
                <span className={`px-1.5 rounded ${badge(l)}`}>{l.status_code}</span>
                <span className="w-12 shrink-0">{l.method}</span>
                <span className="flex-1 truncate">{l.endpoint}</span>
                <span className="text-muted-foreground hidden sm:inline">{l.response_time_ms}ms</span>
                <span className="text-muted-foreground">{new Date(l.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">Limits: 60 reads/min and 30 writes/min per key. Send an <code>Idempotency-Key</code> header on writes so retries after a dropped connection never create duplicates.</p>
      </div>
    </Panel>
  );
}
