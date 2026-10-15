import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Panel } from "@/components/dashboard/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Key = { id: string; name: string; key_prefix: string; scope: string; created_at: string; last_used_at: string | null; revoked_at: string | null };

const BASE = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/public-api`;

export default function DeveloperApiPanel({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const { toast } = useToast();
  const [keys, setKeys] = useState<Key[]>([]);
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"reputation" | "full">("reputation");
  const [fresh, setFresh] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("project_api_keys").select("id,name,key_prefix,scope,created_at,last_used_at,revoked_at")
      .eq("project_id", projectId).order("created_at", { ascending: false });
    setKeys((data as Key[]) ?? []);
  };
  useEffect(() => { load(); }, [projectId]);

  const create = async () => {
    const { data, error } = await supabase.rpc("create_project_api_key", { _project_id: projectId, _name: name, _scope: scope });
    if (error) return toast({ title: "Couldn't create key", description: error.message, variant: "destructive" });
    setFresh(data as string); setName(""); load();
  };
  const revoke = async (id: string) => {
    await supabase.from("project_api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", id);
    load();
  };
  const copy = (t: string) => { navigator.clipboard.writeText(t); toast({ title: "Copied" }); };

  return (
    <Panel title="Developer API">
      <div className="space-y-4 text-sm">
        <p className="text-muted-foreground text-xs">
          Use RaidFi inside your own app. <b>Reputation</b> keys only read scores and leaderboards. <b>Full</b> keys can also submit, list and verify contributions and read metrics.
        </p>
        {canEdit && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Input placeholder="Key name (e.g. Discord bot)" value={name} onChange={(e) => setName(e.target.value)} />
            <select value={scope} onChange={(e) => setScope(e.target.value as "reputation" | "full")}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="reputation">Reputation only</option>
              <option value="full">Full access</option>
            </select>
            <Button onClick={create}><KeyRound className="h-4 w-4 mr-1" />Create key</Button>
          </div>
        )}
        {fresh && (
          <div className="rounded-md border border-primary/40 bg-primary/5 p-3 space-y-2">
            <p className="text-xs">Copy this key now. It won't be shown again.</p>
            <div className="flex gap-2"><code className="text-xs break-all flex-1">{fresh}</code>
              <Button size="sm" variant="outline" onClick={() => copy(fresh)}><Copy className="h-3 w-3" /></Button></div>
          </div>
        )}
        <ul className="divide-y divide-border">
          {keys.map((k) => (
            <li key={k.id} className="py-2 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className={k.revoked_at ? "line-through text-muted-foreground" : ""}>{k.name} <span className="text-[10px] uppercase text-muted-foreground">· {k.scope}</span></p>
                <p className="text-[11px] text-muted-foreground font-mono">{k.key_prefix}… · {k.last_used_at ? `used ${new Date(k.last_used_at).toLocaleDateString()}` : "never used"}</p>
              </div>
              {canEdit && !k.revoked_at && <Button size="sm" variant="ghost" onClick={() => revoke(k.id)}>Revoke</Button>}
            </li>
          ))}
          {keys.length === 0 && <li className="py-2 text-xs text-muted-foreground">No keys yet.</li>}
        </ul>
        <div className="rounded-md bg-muted/40 p-3 space-y-1">
          <div className="flex items-center justify-between"><p className="text-xs font-medium">Base URL</p>
            <Button size="sm" variant="ghost" onClick={() => copy(BASE)}><Copy className="h-3 w-3" /></Button></div>
          <code className="text-[11px] break-all">{BASE}</code>
          <pre className="text-[11px] whitespace-pre-wrap text-muted-foreground mt-2">{`Authorization: Bearer rf_live_...
GET   /reputation/:xhandle
POST  /reputation/batch   {"identifiers":["a","b"]}
GET   /leaderboard?limit=25
GET   /contributions?status=pending   (full)
POST  /contributions {"email","post_url"}   (full)
PATCH /contributions/:id/verify {"status","points"}   (full)
GET   /metrics   (full)`}</pre>
        </div>
      </div>
    </Panel>
  );
}
