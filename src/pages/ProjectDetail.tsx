import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, ShieldCheck, Clock } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

interface FeedRow {
  id: string;
  post_url: string;
  created_at: string;
  status: string;
  content_type: string;
  manual_score: number | null;
  ai_score: number | null;
  points_earned: number;
  post_text: string | null;
  post_author: string | null;
  author_name: string | null;
  x_username: string | null;
  referral_code: string | null;
}

const ProjectDetail = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any | null>(null);
  const [rows, setRows] = useState<FeedRow[]>([]);
  const [shown, setShown] = useState(6);

  useSEO({
    title: project ? `${project.name} on RaidFi` : "Project - RaidFi",
    description: project?.description ?? "Contribution activity and contributor reputation for this Web3 project on RaidFi.",
    path: `/p/${slug ?? ""}`,
  });

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data: p } = await supabase
        .from("projects" as any)
        .select("id,name,slug,website,x_handle,telegram,description,verification,status,trust_score,x_verified,created_at")
        .eq("slug", slug)
        .eq("is_private", false)
        .maybeSingle();
      setProject((p as any) ?? null);
      if (p) {
        const { data: c } = await supabase
          .from("contributions_feed" as any)
          .select("id,post_url,created_at,status,content_type,manual_score,ai_score,points_earned,post_text,post_author,author_name,x_username,referral_code")
          .eq("project_id", (p as any).id)
          .eq("published_to_feed", true)
          .neq("status", "rejected")
          .order("created_at", { ascending: false })
          .limit(60);
        setRows(((c as any) ?? []) as FeedRow[]);
      }
      setLoading(false);
    })();
  }, [slug]);

  const contributors = useMemo(() => {
    const map = new Map<string, { label: string; code: string | null; posts: number; approved: number }>();
    rows.forEach((r) => {
      const key = r.referral_code ?? r.x_username ?? r.author_name ?? r.post_author ?? r.id;
      const label = r.x_username ? `@${r.x_username.replace(/^@/, "")}` : (r.author_name || r.post_author || "Contributor");
      const cur = map.get(key) ?? { label, code: r.referral_code ?? null, posts: 0, approved: 0 };
      cur.posts += 1;
      if (r.status === "approved") cur.approved += 1;
      map.set(key, cur);
    });
    return [...map.values()].sort((a, b) => b.approved - a.approved || b.posts - a.posts);
  }, [rows]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 text-center px-6">
          <h1 className="text-lg font-semibold text-foreground">Project not found</h1>
          <p className="text-sm text-muted-foreground mt-2">This project isn't listed on RaidFi.</p>
          <Link to="/explore" className="text-sm text-primary underline underline-offset-4 mt-3 inline-block">Back to Explore</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const approved = rows.filter((r) => r.status === "approved").length;
  const handle = project.x_handle ? project.x_handle.replace(/^@/, "") : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl space-y-6">
          <header className="space-y-2">
            <Link to="/explore" className="text-[11px] text-muted-foreground hover:text-foreground">← Explore</Link>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              {project.name}
              {project.x_verified && <ShieldCheck className="w-5 h-5 text-primary" />}
            </h1>
            <p className="text-xs text-muted-foreground capitalize">
              {project.verification} · trust {project.trust_score} · {project.status}
            </p>
            {project.description && <p className="text-sm text-muted-foreground max-w-2xl">{project.description}</p>}
            <div className="flex flex-wrap gap-3 text-xs pt-1">
              {project.website && <a href={project.website} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1">Website <ExternalLink className="w-3 h-3" /></a>}
              {handle && <a href={`https://x.com/${handle}`} target="_blank" rel="noreferrer" className="text-primary">@{handle}</a>}
              {project.telegram && <a href={project.telegram} target="_blank" rel="noreferrer" className="text-primary">Telegram</a>}
            </div>
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Tracked contributions", rows.length],
              ["Approved", approved],
              ["Contributors", contributors.length],
              ["Trust score", project.trust_score],
            ].map(([label, value]) => (
              <Card key={String(label)}><CardContent className="p-4">
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className="text-xl font-semibold text-foreground mt-1">{value as number}</p>
              </CardContent></Card>
            ))}
          </div>

          <section>
            <h2 className="text-sm font-semibold text-foreground mb-2">Contributors</h2>
            {contributors.length === 0 ? (
              <p className="text-xs text-muted-foreground">No tracked contributors for this project yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {contributors.slice(0, 12).map((c, i) => (
                  <Card key={i}><CardContent className="p-3 flex items-center justify-between gap-2">
                    {c.code ? (
                      <Link to={`/u/${c.code}`} className="text-xs font-medium text-foreground hover:underline truncate">{c.label}</Link>
                    ) : (
                      <span className="text-xs font-medium text-foreground truncate">{c.label}</span>
                    )}
                    <span className="text-[11px] text-muted-foreground shrink-0">{c.approved}/{c.posts} approved</span>
                  </CardContent></Card>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground mb-2">Contribution activity</h2>
            {rows.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nothing tracked for this project yet.</p>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 items-start">
                  {rows.slice(0, shown).map((r) => {
                    const score = r.manual_score ?? r.ai_score;
                    const who = r.x_username ? `@${r.x_username.replace(/^@/, "")}` : (r.author_name || r.post_author || "Contributor");
                    return (
                      <Card key={r.id}><CardContent className="p-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12px] font-semibold text-foreground truncate">{who}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${r.status === "approved" ? "bg-primary/15 text-primary" : "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"}`}>
                            {r.status === "approved" ? `✓ Approved${score != null ? ` · ${score}` : ""}` : "⏳ Awaiting"}
                          </span>
                        </div>
                        {r.post_text && <p className="text-[13px] text-foreground mt-2 line-clamp-5 whitespace-pre-wrap break-words">{r.post_text}</p>}
                        <div className="mt-2 flex items-center justify-between text-[10.5px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(r.created_at).toLocaleDateString()}</span>
                          <a href={r.post_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary">Open <ExternalLink className="w-3 h-3" /></a>
                        </div>
                      </CardContent></Card>
                    );
                  })}
                </div>
                {shown < rows.length && (
                  <div className="text-center pt-4">
                    <Button variant="outline" size="sm" onClick={() => setShown((s) => s + 6)}>Load more</Button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
