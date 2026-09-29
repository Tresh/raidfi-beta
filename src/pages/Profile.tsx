import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trophy, ExternalLink, ArrowLeft, Sparkles, FileText, Clock, Hash } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { BASE_URL } from "@/lib/constants";

interface Contribution {
  id: string;
  post_url: string;
  status: string;
  content_type: string;
  points_earned: number;
  manual_score: number | null;
  ai_score: number | null;
  post_text: string | null;
  post_author: string | null;
  created_at: string;
}

const decodeEntities = (s: string) =>
  s.replace(/&mdash;/g, "-").replace(/&ndash;/g, "–").replace(/&hellip;/g, "…")
   .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const stripMeta = (raw: string) => {
  const t = decodeEntities(raw).trim();
  const m = t.match(/\s*[-–-]\s*[^\n]+?\(@[^)]+\)[^\n]*$/);
  return m && m.index !== undefined ? t.slice(0, m.index).trim() : t;
};

const Profile = () => {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ email: string; name: string | null; total_points: number; referred_by: string | null; referral_code: string } | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [stats, setStats] = useState({ approved: 0, total: 0, topScore: 0 });
  const [notFound, setNotFound] = useState(false);

  const profileName = profile?.name || code || "Contributor";
  useSEO({
    title: `${profileName} - RaidFi Contributor`,
    description: `View ${profileName}'s RaidFi contributions, XP, rank, and reputation in the Web3 social intelligence layer.`,
    path: code ? `/u/${code}` : "/u",
    ogType: "profile",
  });


  useEffect(() => {
    if (!code) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("email, name, total_points, user_id, referred_by, referral_code")
        .eq("referral_code", code)
        .maybeSingle();
      if (!p) { setNotFound(true); setLoading(false); return; }
      setProfile(p);

      const [{ data: c }, { data: t }, { count: higher }, { data: allContrib }] = await Promise.all([
        supabase
          .from("contributions_feed" as any)
          .select("id,post_url,status,content_type,points_earned,manual_score,ai_score,post_text,post_author,created_at")
          .eq("user_id", (p as any).user_id ?? "00000000-0000-0000-0000-000000000000")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase.rpc("get_profile_tags" as any, { _referral_code: code } as any),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gt("total_points", p.total_points),
        supabase.from("contributions_feed" as any).select("status,manual_score,ai_score").eq("user_id", (p as any).user_id ?? "00000000-0000-0000-0000-000000000000"),
      ]);

      setContributions((c as any) || []);
      setTags(((t as any) || []).map((x: any) => x.tag));
      setRank((higher ?? 0) + 1);

      const all = (allContrib as any[]) || [];
      const approved = all.filter(x => x.status === "approved").length;
      const topScore = all.reduce((mx, x) => {
        const s = x.manual_score ?? x.ai_score ?? 0;
        return s > mx ? s : mx;
      }, 0);
      setStats({ approved, total: all.length, topScore });

      setLoading(false);
    })();
  }, [code]);

  const maskEmail = (e: string) => e.replace(/(.{3}).*(@.*)/, "$1***$2");
  const displayName = profile?.name || (profile ? maskEmail(profile.email) : "");
  const initial = displayName.replace(/^@/, "").trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <Link to="/feed" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to feed
          </Link>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : notFound || !profile ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Profile not found.</CardContent></Card>
          ) : (
            <>
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "ProfilePage", "mainEntity": { "@type": "Person", "name": displayName, "description": `${displayName}'s RaidFi contributions, XP, rank, and reputation in the Web3 social intelligence layer.` }, "url": `${BASE_URL}/u/${code}` }).replace(/</g, "\\u003c") }} />
              {/* Header card with gradient banner */}
              <Card className="mb-4 overflow-hidden border-border/60">
                <div className="h-24 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />
                <CardContent className="p-6 pt-0">
                  <div className="flex items-end gap-4 -mt-12 mb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 text-primary flex items-center justify-center text-3xl font-bold ring-4 ring-background shadow-lg shrink-0">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{displayName}</h1>
                      <p className="text-xs text-muted-foreground">{maskEmail(profile.email)}</p>
                    </div>
                  </div>

                  {/* Hero stats row: XP + Rank */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 p-4">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                        <Trophy className="w-3 h-3" /> Total XP
                      </div>
                      <div className="text-2xl font-bold text-foreground">{profile.total_points.toLocaleString()}</div>
                    </div>
                    <div className="rounded-xl bg-muted/40 border border-border p-4">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                        <Hash className="w-3 h-3" /> Rank
                      </div>
                      <div className="text-2xl font-bold text-foreground">{rank ? `#${rank}` : "-"}</div>
                    </div>
                  </div>

                  {(tags.length > 0 || profile.referred_by) && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {profile.referred_by && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-pink-500/10 text-pink-400 border border-pink-500/20 font-medium">
                          Referred by: {profile.referred_by}
                        </span>
                      )}
                      {tags.map(t => (
                        <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-primary/10 text-primary border border-primary/20 font-medium">
                          <Sparkles className="w-2.5 h-2.5" /> {t}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Secondary stats cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <Card className="border-border/60">
                  <CardContent className="p-4">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Approved</div>
                    <div className="text-xl font-bold text-foreground">{stats.approved}</div>
                  </CardContent>
                </Card>
                <Card className="border-border/60">
                  <CardContent className="p-4">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Total posts</div>
                    <div className="text-xl font-bold text-foreground">{stats.total}</div>
                  </CardContent>
                </Card>
                <Card className="border-border/60">
                  <CardContent className="p-4">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Top score</div>
                    <div className="text-xl font-bold text-foreground">{stats.topScore || "-"}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Contributions feed */}
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Recent contributions</h2>
              </div>

              {contributions.length === 0 ? (
                <Card className="border-dashed"><CardContent className="py-10 text-center text-muted-foreground text-sm">
                  No approved contributions yet.
                </CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {contributions.map(c => {
                    const score = c.manual_score ?? c.ai_score;
                    const body = c.post_text ? stripMeta(c.post_text) : null;
                    return (
                      <Card key={c.id} className="hover:bg-accent/20 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider font-medium">
                              {c.content_type}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-primary font-semibold">+{c.points_earned} XP</span>
                              {score != null && score > 10 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                                  ★ {score}
                                </span>
                              )}
                            </div>
                          </div>
                          {body && (
                            <p className="text-sm text-foreground whitespace-pre-wrap mb-3 line-clamp-5 leading-relaxed">{body}</p>
                          )}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(c.created_at).toLocaleDateString()}</span>
                            </div>
                            <a href={c.post_url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 hover:text-primary">
                              Open <ExternalLink className="w-3 h-3" />
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
