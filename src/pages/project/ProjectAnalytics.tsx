import { useEffect, useState } from "react";
import ProjectLayout from "@/components/project/ProjectLayout";
import { PageHeader, Panel, StatCard } from "@/components/dashboard/Primitives";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const ProjectAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<{ label: string; posts: number; xp: number }[]>([]);
  const [totals, setTotals] = useState({ posts: 0, xp: 0, approvalRate: 0 });

  useEffect(() => {
    const load = async () => {
      const since = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("contributions")
        .select("created_at,points_earned,status")
        .gte("created_at", since)
        .order("created_at", { ascending: true });

      const list = data ?? [];
      const buckets = new Map<string, { posts: number; xp: number }>();
      for (const c of list as any[]) {
        const d = new Date(c.created_at);
        const key = `${d.getMonth() + 1}/${d.getDate()}`;
        const b = buckets.get(key) ?? { posts: 0, xp: 0 };
        b.posts += 1;
        b.xp += c.points_earned ?? 0;
        buckets.set(key, b);
      }
      setSeries([...buckets.entries()].map(([label, v]) => ({ label, ...v })));
      const approved = (list as any[]).filter((c) => c.status === "approved").length;
      setTotals({
        posts: list.length,
        xp: (list as any[]).reduce((s, c) => s + (c.points_earned ?? 0), 0),
        approvalRate: list.length ? Math.round((approved / list.length) * 100) : 0,
      });
      setLoading(false);
    };
    load();
  }, []);

  return (
    <ProjectLayout>
      <PageHeader title="Analytics" subtitle="Ecosystem contribution volume and reward flow over the last 8 weeks." />

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <StatCard label="Contributions" value={totals.posts} />
            <StatCard label="XP distributed" value={totals.xp.toLocaleString()} accent />
            <StatCard label="Approval rate" value={`${totals.approvalRate}%`} />
          </div>

          <Panel title="Contribution cadence" description="Posts and XP per active day.">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="xp" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" />
                  <Area type="monotone" dataKey="posts" stroke="hsl(var(--muted-foreground))" fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </>
      )}
    </ProjectLayout>
  );
};

export default ProjectAnalytics;
