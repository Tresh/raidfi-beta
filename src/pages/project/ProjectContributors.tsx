import { useEffect, useMemo, useState } from "react";
import ProjectLayout from "@/components/project/ProjectLayout";
import { PageHeader } from "@/components/dashboard/Primitives";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

type Row = { email: string; display_name: string; total_xp: number; overall_rank: number };

const ProjectContributors = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [minXp, setMinXp] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.rpc("get_leaderboard", { _period: "all" });
      setRows((data as any) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          r.total_xp >= minXp &&
          (q.trim() === "" || (r.display_name ?? "").toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [rows, q, minXp],
  );

  const tier = (xp: number) =>
    xp >= 2000 ? "Core" : xp >= 1000 ? "Trusted" : xp >= 400 ? "Established" : xp >= 100 ? "Emerging" : "New";

  return (
    <ProjectLayout>
      <PageHeader
        title="Contributor discovery"
        subtitle="Find contributors by reputation before you brief a campaign."
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search contributors" className="pl-9 h-9" />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          Min XP
          <Input type="number" min={0} step={50} value={minXp} onChange={(e) => setMinXp(Number(e.target.value))} className="h-9 w-24" />
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">No contributors match those filters.</p>
      ) : (
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          {filtered.map((r) => (
            <div key={r.email} className="p-3.5 flex items-center gap-3">
              <span className="text-xs tabular-nums text-muted-foreground w-8 shrink-0">#{r.overall_rank}</span>
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                {(r.display_name || "?").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground truncate">{r.display_name}</p>
                <p className="text-[11px] text-muted-foreground">{tier(r.total_xp)} contributor</p>
              </div>
              <span className="text-sm font-semibold text-primary tabular-nums shrink-0">{r.total_xp.toLocaleString()} XP</span>
            </div>
          ))}
        </div>
      )}
    </ProjectLayout>
  );
};

export default ProjectContributors;
