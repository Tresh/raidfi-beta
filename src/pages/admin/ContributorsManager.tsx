import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Loader2, BadgeCheck, ExternalLink } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/Primitives";

type Profile = {
  id: string;
  email: string;
  name: string | null;
  x_username: string | null;
  x_verified: boolean;
  total_points: number | null;
  referral_count: number | null;
  created_at: string | null;
};

type Agg = { total: number; approved: number; last: string | null };

const ContributorsManager = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [agg, setAgg] = useState<Record<string, Agg>>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"xp" | "recent" | "contributions">("xp");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id,email,name,x_username,x_verified,total_points,referral_count,created_at")
          .order("total_points", { ascending: false })
          .limit(1000),
        supabase.from("contributions").select("user_email,status,created_at").limit(5000),
      ]);
      const map: Record<string, Agg> = {};
      for (const row of (c as any[]) ?? []) {
        const key = String(row.user_email || "").toLowerCase();
        if (!key) continue;
        const entry = (map[key] ??= { total: 0, approved: 0, last: null });
        entry.total += 1;
        if (row.status === "approved") entry.approved += 1;
        if (!entry.last || row.created_at > entry.last) entry.last = row.created_at;
      }
      setAgg(map);
      setProfiles((p as any) ?? []);
      setLoading(false);
    })();
  }, []);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = profiles.filter(
      (p) =>
        !term ||
        p.email.toLowerCase().includes(term) ||
        (p.name ?? "").toLowerCase().includes(term) ||
        (p.x_username ?? "").toLowerCase().includes(term),
    );
    return [...list].sort((a, b) => {
      if (sort === "xp") return (b.total_points ?? 0) - (a.total_points ?? 0);
      if (sort === "recent") return (b.created_at ?? "").localeCompare(a.created_at ?? "");
      return (agg[b.email.toLowerCase()]?.total ?? 0) - (agg[a.email.toLowerCase()]?.total ?? 0);
    });
  }, [profiles, q, sort, agg]);

  const stats = useMemo(() => {
    const verified = profiles.filter((p) => p.x_verified).length;
    const contributing = profiles.filter((p) => (agg[p.email.toLowerCase()]?.total ?? 0) > 0).length;
    return { total: profiles.length, verified, contributing };
  }, [profiles, agg]);

  return (
    <div>
      <PageHeader
        title="Contributors"
        subtitle="Everyone with a RaidFi account, their connected X identity and their contribution history."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Accounts" value={stats.total} />
        <StatCard label="X verified" value={stats.verified} accent />
        <StatCard label="Have contributed" value={stats.contributing} />
        <StatCard label="Showing" value={rows.length} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email or X handle"
          className="h-9 max-w-xs"
        />
        <div className="flex items-center gap-1.5 ml-auto">
          {(["xp", "contributions", "recent"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-colors ${
                sort === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "recent" ? "newest" : s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">No contributors match that search.</p>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 py-2.5 font-medium">Contributor</th>
                <th className="px-4 py-2.5 font-medium">X</th>
                <th className="px-4 py-2.5 font-medium text-right">XP</th>
                <th className="px-4 py-2.5 font-medium text-right">Posts</th>
                <th className="px-4 py-2.5 font-medium text-right">Approved</th>
                <th className="px-4 py-2.5 font-medium text-right">Referrals</th>
                <th className="px-4 py-2.5 font-medium text-right">Last post</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const a = agg[p.email.toLowerCase()];
                return (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 min-w-0">
                      <p className="text-foreground truncate">{p.name || "Unnamed"}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{p.email}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      {p.x_username ? (
                        <a
                          href={`https://x.com/${p.x_username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary"
                        >
                          @{p.x_username}
                          {p.x_verified && <BadgeCheck className="w-3.5 h-3.5" />}
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{p.total_points ?? 0}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{a?.total ?? 0}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{a?.approved ?? 0}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{p.referral_count ?? 0}</td>
                    <td className="px-4 py-2.5 text-right text-[11px] text-muted-foreground">
                      {a?.last ? new Date(a.last).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContributorsManager;
