import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trophy, ExternalLink, ArrowLeft } from "lucide-react";

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
}

const Profile = () => {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ email: string; name: string | null; total_points: number } | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!code) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("email, name, total_points")
        .eq("referral_code", code)
        .maybeSingle();
      if (!p) { setNotFound(true); setLoading(false); return; }
      setProfile(p);

      const [{ data: c }, { data: t }] = await Promise.all([
        supabase
          .from("contributions")
          .select("id,post_url,status,content_type,points_earned,manual_score,ai_score,post_text,created_at")
          .eq("user_email", p.email)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase.from("profile_tags" as any).select("tag").eq("user_email", p.email),
      ]);
      setContributions((c as any) || []);
      setTags(((t as any) || []).map((x: any) => x.tag));
      setLoading(false);
    })();
  }, [code]);

  const maskEmail = (e: string) => e.replace(/(.{3}).*(@.*)/, "$1***$2");

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
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">{profile.name || maskEmail(profile.email)}</h1>
                      <p className="text-sm text-muted-foreground mt-0.5">{maskEmail(profile.email)}</p>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {tags.map(t => (
                            <span key={t} className="px-2 py-0.5 rounded-full text-[11px] bg-primary/10 text-primary font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">{profile.total_points} XP</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Approved contributions</h2>
              {contributions.length === 0 ? (
                <Card className="border-dashed"><CardContent className="py-10 text-center text-muted-foreground text-sm">
                  No approved contributions yet.
                </CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {contributions.map(c => (
                    <Card key={c.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
                            {c.content_type}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-primary font-semibold">+{c.points_earned} XP</span>
                            {(c.manual_score ?? c.ai_score ?? 0) > 10 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                                ★ Score {c.manual_score ?? c.ai_score}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {c.post_text && (
                          <p className="text-sm text-foreground whitespace-pre-wrap mb-2 line-clamp-6">{c.post_text}</p>
                        )}
                        <a href={c.post_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          Open <ExternalLink className="w-3 h-3" />
                        </a>
                      </CardContent>
                    </Card>
                  ))}
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
