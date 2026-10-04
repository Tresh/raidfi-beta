import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, ShieldCheck } from "lucide-react";
import type { ContributorData } from "@/hooks/useContributorData";

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mr-2 fill-current" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const RaidCard = ({ data }: { data: ContributorData }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [projects, setProjects] = useState<{ name: string; count: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const p = data.profile as (ContributorData["profile"] & { x_username?: string | null }) | null;
  const rep = data.reputation;

  useEffect(() => {
    if (!data.email) return;
    supabase
      .from("contributions")
      .select("project_id, projects(name)")
      .ilike("user_email", data.email.toLowerCase())
      .neq("status", "rejected")
      .limit(500)
      .then(({ data: rows }) => {
        const counts = new Map<string, number>();
        (rows ?? []).forEach((r: any) => {
          const name = r.projects?.name ?? "RaidFi";
          counts.set(name, (counts.get(name) ?? 0) + 1);
        });
        setProjects([...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5));
      });
  }, [data.email]);

  const name = p?.name || p?.x_username || data.email?.split("@")[0] || "Contributor";
  const handle = p?.x_username ? `@${p.x_username.replace(/^@/, "")}` : null;
  const joined = p?.created_at ? new Date(p.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—";
  const idNo = (p?.referral_code || "RAIDFI").toUpperCase();
  const raids = data.contributions.filter((c) => c.status !== "rejected").length;
  const refUrl = p?.referral_code ? `${window.location.origin}/beta?ref=${p.referral_code}` : window.location.origin;

  const download = async () => {
    if (!ref.current) return;
    setBusy(true);
    try {
      const url = await toPng(ref.current, { pixelRatio: 1200 / ref.current.offsetWidth, cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = `raidfi-card-${idNo}.png`;
      a.click();
    } catch {
      toast({ title: "Couldn't create image", description: "Try again in a moment.", variant: "destructive" });
    }
    setBusy(false);
  };

  const share = () => {
    const top = projects.slice(0, 3).map((x) => x.name).join(", ");
    const text = `My Web3 contributor ID on @RaidFi 🪪\n\n🏆 ${rep.score}/1000 · ${rep.tier.name}\n⚡ ${raids} contributions${top ? ` across ${top}` : ""}\n\nGet your card in the beta:`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(refUrl)}`, "_blank", "noopener");
  };

  return (
    <div className="space-y-3">
      <div
        ref={ref}
        className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-2xl border border-primary/30 bg-card p-[4%] text-foreground shadow-xl"
        style={{ backgroundImage: "radial-gradient(circle at 85% 15%, hsl(var(--primary) / 0.22), transparent 45%), linear-gradient(hsl(var(--border) / 0.35) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.35) 1px, transparent 1px)", backgroundSize: "100% 100%, 24px 24px, 24px 24px" }}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="" className="h-7 w-7 rounded-md" crossOrigin="anonymous" />
              <div>
                <p className="text-sm font-bold leading-none">RaidFi</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Contributor ID</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-[11px] text-primary">#{idNo}</p>
              <p className="text-[9px] text-muted-foreground">Since {joined}</p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-xl font-bold sm:text-2xl">{name}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                {handle && <span>{handle}</span>}
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                  <ShieldCheck className="h-3 w-3" /> {rep.tier.name}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tabular-nums leading-none sm:text-4xl">{rep.score}</p>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Rep / 1000</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-y border-border/60 py-2">
            {[["Total XP", data.totalXp.toLocaleString()], ["Rank", data.rank ? `#${data.rank}` : "—"], ["Contributions", raids]].map(([l, v]) => (
              <div key={l as string}>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{l}</p>
                <p className="text-sm font-semibold tabular-nums sm:text-base">{v}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-1 text-[9px] uppercase tracking-widest text-muted-foreground">Top projects</p>
            <div className="flex flex-wrap gap-1">
              {projects.length ? projects.map((x) => (
                <span key={x.name} className="rounded-md border border-border bg-background/60 px-2 py-0.5 text-[10px]">
                  {x.name} <span className="text-muted-foreground">· {x.count}</span>
                </span>
              )) : <span className="text-[10px] text-muted-foreground">No contributions yet</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={share}><XIcon />Share on X</Button>
        <Button size="sm" variant="outline" onClick={download} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-2 h-3.5 w-3.5" />}Download
        </Button>
      </div>
    </div>
  );
};

export default RaidCard;
