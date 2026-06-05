import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ExternalLink, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TWEET_URL_REGEX = /^https?:\/\/(x\.com|twitter\.com)\/\w+\/status\/(\d+)/;
const extractTweetId = (url: string): string | null => {
  const m = url.match(TWEET_URL_REGEX);
  return m ? m[2] : null;
};

interface Contribution {
  id: string;
  user_email: string;
  post_url: string;
  points_earned: number;
  created_at: string;
  status: string;
  content_type: string;
  manual_score: number | null;
  ai_score: number | null;
  ai_feedback?: string | null;
  post_text?: string | null;
  post_author?: string | null;
}

const TweetEmbed = ({ tweetId, postUrl }: { tweetId: string; postUrl: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const renderTweet = () => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = "";
      const twttr = (window as any).twttr;
      if (twttr?.widgets?.createTweet) {
        twttr.widgets.createTweet(tweetId, containerRef.current, { theme: "dark", dnt: true })
          .then(() => setLoading(false)).catch(() => setLoading(false));
      } else setLoading(false);
    };
    if (!(window as any).twttr) {
      const s = document.createElement("script");
      s.src = "https://platform.twitter.com/widgets.js";
      s.async = true;
      s.onload = () => (window as any).twttr?.ready?.(renderTweet);
      document.head.appendChild(s);
    } else (window as any).twttr.ready?.(renderTweet) || renderTweet();
  }, [tweetId]);
  return (
    <div className="min-h-[200px]">
      <div ref={containerRef} />
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <a href={postUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-muted-foreground hover:text-primary">Open post</a>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status, score }: { status: string; score: number | null }) => {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
        ✓ Approved{score != null ? ` · ${score}` : ""}
        {score != null && score > 10 && <Star className="w-2.5 h-2.5 fill-current" />}
      </span>
    );
  }
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 font-medium">
      ⏳ Awaiting score
    </span>
  );
};

const Feed = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [refMap, setRefMap] = useState<Record<string, string>>({});
  const PAGE_SIZE = 20;

  const fetchContributions = useCallback(async (pageNum: number, append = false) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data } = await supabase
      .from("contributions")
      .select("id,user_email,post_url,points_earned,created_at,status,content_type,manual_score,ai_score,ai_feedback,post_text")
      .eq("published_to_feed", true)
      .neq("status", "rejected")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (data) {
      setContributions(prev => append ? [...prev, ...(data as any)] : (data as any));
      setHasMore(data.length === PAGE_SIZE);
      // Fetch referral codes for these emails to build profile links
      const emails = Array.from(new Set((data as any[]).map(d => d.user_email)));
      if (emails.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("email, referral_code")
          .in("email", emails);
        if (profs) {
          setRefMap(prev => {
            const next = { ...prev };
            (profs as any[]).forEach(p => { if (p.referral_code) next[p.email] = p.referral_code; });
            return next;
          });
        }
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchContributions(0); }, [fetchContributions]);

  const mask = (e: string) => e.replace(/(.{3}).*(@.*)/, "$1***$2");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Live <span className="text-gradient">Feed</span>
            </h1>
            <p className="text-muted-foreground text-sm">Community posts about RaidFi.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : contributions.length === 0 ? (
            <Card className="border-dashed"><CardContent className="py-12 text-center"><p className="text-muted-foreground">No posts yet.</p></CardContent></Card>
          ) : (
            <div className="space-y-4">
              {contributions.map((c) => {
                const tweetId = extractTweetId(c.post_url);
                const score = c.manual_score ?? c.ai_score;
                const code = refMap[c.user_email];
                const hasSavedText = !!c.post_text && c.post_text.trim().length > 0;
                return (
                  <Card key={c.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {code ? (
                            <Link to={`/u/${code}`} className="text-xs text-foreground hover:text-primary font-medium">{mask(c.user_email)}</Link>
                          ) : (
                            <span className="text-xs text-muted-foreground">{mask(c.user_email)}</span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">{c.content_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={c.status} score={score} />
                          <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {hasSavedText ? (
                        <div className="rounded-xl border border-border bg-card p-4">
                          {(c as any).post_author && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">
                                {(c as any).post_author.replace(/^@/, "").slice(0, 1).toUpperCase()}
                              </div>
                              <div className="flex flex-col leading-tight">
                                <span className="text-sm font-medium text-foreground">{(c as any).post_author}</span>
                                <span className="text-[11px] text-muted-foreground">on X</span>
                              </div>
                            </div>
                          )}
                          <p className="text-sm text-foreground whitespace-pre-wrap break-words">{c.post_text}</p>
                          <a
                            href={c.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:underline"
                          >
                            View on X <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : tweetId ? (
                        <TweetEmbed tweetId={tweetId} postUrl={c.post_url} />
                      ) : (
                        <a href={c.post_url} target="_blank" rel="noopener noreferrer"
                          className="block p-4 rounded-lg bg-muted/50 hover:bg-muted text-sm text-primary break-all">{c.post_url}</a>
                      )}
                      {c.ai_feedback && (
                        <div className="mt-2 px-3 py-2 rounded-md bg-muted/50 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">AI Review:</span> {c.ai_feedback}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                        <a href={c.post_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors ml-auto">
                          <ExternalLink className="w-3.5 h-3.5" /><span>Open</span>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {hasMore && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm" onClick={() => { const np = page + 1; setPage(np); fetchContributions(np, true); }}>
                    Load More
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Feed;
