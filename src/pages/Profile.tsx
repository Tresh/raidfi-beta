import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ExternalLink, ArrowLeft, ShieldCheck, Clock } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { BASE_URL } from "@/lib/constants";
import { computeReputation } from "@/lib/reputation";

interface Contribution {
  id: string;
  post_url: string;
  status: string;
  content_type: string;
  points_earned: number;
  manual_score: number | null;
  ai_score: number | null;
  post_text: string | null;
  created_at: string;
  project_id: string | null;
  project_name: string | null;
}

const decodeEntities = (s: string) =>
  s.replace(/&mdash;/g, "-").replace(/&ndash;/g, "–").replace(/&hellip;/g, "…")
   .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const stripMeta = (raw: string) => {
  const t = decodeEntities(raw).trim();
  const m = t.match(/\s*[-–-]\s*[^\n]+?\(@[^)]+\)[^\n]*$/);
  return m && m.index !== undefined ? t.slice(0, m.index).trim() : t;
};

const PostImage = ({ url }: { url: string }) => {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!/status\/\d+/.test(url)) return;
    let off = false;
    supabase.functions.invoke("fetch-post-image", { body: { post_url: url } })
      .then(({ data }) => { if (!off && data?.post_image_url) setSrc(data.post_image_url); })
      .catch(() => {});
    return () => { off = true; };
  }, [url]);
  if (!src) return null;
  return <img src={src} alt="Post media" loading="lazy" className="w-full max-h-80 object-cover rounded-md border border-border mb-3" />;
};

const Profile = () => {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [all, setAll] = useState<Contribution[]>([]);
  const [project, setProject] = useState<string>("all");
  const [notFound, setNotFound] = useState(false);

  const profileName = profile?.name || profile?.x_username || code || "Contributor";
  useSEO({
    title: `${profileName} - RaidFi Reputation`,
    description: `${profileName}'s verified contribution record and reputation on RaidFi.`,
    path: code ? `/u/${code}` : "/u",
    ogType: "profile",
  });

  useEffect(() => {
    if (!code) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("email, name, user_id, referral_code, referral_count, created_at, x_username, x_verified")
        .eq("referral_code", code)
        .maybeSingle();
      if (!p) { setNotFound(true); setLoading(false); return; }
      setProfile(p);
      const { data: c } = await supabase
        .from("contributions_feed" as any)
        .select("id,post_url,status,content_type,points_earned,manual_score,ai_score,post_text,created_at,project_id,project_name")
        .eq("user_id", (p as any).user_id)
        .order("created_at", { ascending: false })
        .limit(500);
      setAll(((c as any) || []) as Contribution[]);
      setLoading(false);
    })();
  }, [code]);

  const projects = useMemo(() => {
    const m = new Map<string, { name: string; count: number }>();
    all.forEach((c) => {
      const k = c.project_id ?? "raidfi";
      const e = m.get(k) ?? { name: c.project_name ?? "RaidFi", count: 0 };
      e.count++; m.set(k, e);
    });
    return [...m.entries()].sort((a, b) => b[1].count - a[1].count);
  }, [all]);

  const scoped = useMemo(
    () => project === "all" ? all : all.filter((c) => (c.project_id ?? "raidfi") === project),
    [all, project]
  );
  const rep = useMemo(() => computeReputation({
    contributions: scoped,
    telegramLinked: false,
    referralCount: profile?.referral_count ?? 0,
    accountCreatedAt: profile?.created_at,
  }), [scoped, profile]);
  const approved = scoped.filter((c) => c.status === "approved");

  const maskEmail = (e: string) => e.replace(/(.{3}).*(@.*)/, "$1***$2");
  const displayName = profile?.name || (profile?.x_username ? `@${profile.x_username}` : profile ? maskEmail(profile.email) : "");
  const initial = displayName.replace(/^@/, "").charAt(0).toUpperCase() || "?";
  const scopeLabel = project === "all" ? "across all projects" : `on ${projects.find(([k]) => k === project)?.[1].name}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <Link to="/feed" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : notFound || !profile ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Profile not found.</CardContent></Card>
          ) : (
            <>
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "ProfilePage", "mainEntity": { "@type": "Person", "name": displayName }, "url": `${BASE_URL}/u/${code}` }).replace(/</g, "\\u003c") }} />

              {/* Identity */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-muted text-foreground flex items-center justify-center text-2xl font-bold border border-border shrink-0">{initial}</div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate flex items-center gap-2">
                    {displayName}
                    {profile.x_verified && <ShieldCheck className="w-4 h-4 text-primary shrink-0" aria-label="X verified" />}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Contributor since {profile.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
                  </p>
                </div>
              </div>

              {/* Project filter */}
              {projects.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
                  {[["all", { name: "All projects", count: all.length }] as const, ...projects].map(([k, v]) => (
                    <button key={k} onClick={() => setProject(k)}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${project === k ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border hover:text-foreground"}`}>
                      {v.name} <span className="opacity-60">· {v.count}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Reputation */}
              <Card className="mb-6 border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-end justify-between gap-4 mb-1">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Reputation {scopeLabel}</div>
                      <div className="text-3xl font-bold text-foreground">{rep.score}<span className="text-base text-muted-foreground font-medium"> / 1000</span></div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full border border-border text-foreground font-medium">{rep.tier.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{rep.tier.blurb}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    {[
                      ["Accepted", `${rep.approvedCount}`],
                      ["Acceptance", `${Math.round(rep.approvalRate * 100)}%`],
                      ["Avg quality", rep.approvedCount ? `${rep.avgQuality.toFixed(1)}/20` : "—"],
                      ["Active weeks", `${rep.activeWeeks}/12`],
                    ].map(([l, v]) => (
                      <div key={l} className="rounded-lg bg-muted/40 p-3">
                        <div className="text-lg font-semibold text-foreground">{v}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Accepted contributions</h2>
              {approved.length === 0 ? (
                <Card className="border-dashed"><CardContent className="py-10 text-center text-muted-foreground text-sm">No accepted contributions yet.</CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {approved.slice(0, 50).map((c) => {
                    const score = c.manual_score ?? c.ai_score;
                    const body = c.post_text ? stripMeta(c.post_text) : null;
                    return (
                      <Card key={c.id} className="border-border/60">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-2 mb-2 text-[11px] text-muted-foreground">
                            <span className="truncate">{c.project_name ?? "RaidFi"} · {c.content_type}</span>
                            {score != null && <span className="shrink-0">Quality {score}/20</span>}
                          </div>
                          {body && <p className="text-sm text-foreground whitespace-pre-wrap mb-3 line-clamp-5 leading-relaxed">{body}</p>}
                          <PostImage url={c.post_url} />
                          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{new Date(c.created_at).toLocaleDateString()}</span>
                            <a href={c.post_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
                              View post <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
