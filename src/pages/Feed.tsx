import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ExternalLink, Star, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TWEET_URL_REGEX = /^https?:\/\/(x\.com|twitter\.com)\/\w+\/status\/(\d+)/;
const extractTweetId = (url: string): string | null => {
  const m = url.match(TWEET_URL_REGEX);
  return m ? m[2] : null;
};
const extractHandleFromUrl = (url: string): string | null => {
  const m = url.match(/^https?:\/\/(?:x|twitter)\.com\/([^/]+)\/status\//i);
  return m ? m[1] : null;
};

// Decode HTML entities the edge fn may have missed (e.g. &mdash;)
const decodeEntities = (s: string) =>
  s
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

// Split oEmbed-style text into body + trailing "— Name (@handle) Date"
const splitPostMeta = (raw: string): { body: string; meta: string | null; author: string | null; handle: string | null } => {
  const text = decodeEntities(raw).trim();
  const re = /\s*[—–-]\s*([^\n]+?)\s*\(@([^)]+)\)\s*([^\n]*)$/;
  const m = text.match(re);
  if (m && m.index !== undefined) {
    const author = m[1].trim();
    const handle = m[2].trim();
    const date = (m[3] || "").trim();
    const meta = `${author} (@${handle})${date ? " " + date : ""}`;
    return { body: text.slice(0, m.index).trim(), meta, author, handle };
  }
  return { body: text, meta: null, author: null, handle: null };
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
  post_image_url?: string | null;
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
    <div className="min-h-[120px]">
      <div ref={containerRef} />
      {loading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
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
    <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 font-medium">
      ⏳ Awaiting
    </span>
  );
};

const TypeBadge = ({ type }: { type: string }) => (
  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider font-medium">
    {type}
  </span>
);

const Feed = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [refMap, setRefMap] = useState<Record<string, { code?: string; name?: string }>>({});
  const PAGE_SIZE = 20;

  const fetchContributions = useCallback(async (pageNum: number, append = false) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data } = await supabase
      .from("contributions")
      .select("id,user_email,post_url,points_earned,created_at,status,content_type,manual_score,ai_score,ai_feedback,post_text,post_author,post_image_url")
      .eq("published_to_feed", true)
      .neq("status", "rejected")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (data) {
      setContributions(prev => append ? [...prev, ...(data as any)] : (data as any));
      setHasMore(data.length === PAGE_SIZE);
      const emails = Array.from(new Set((data as any[]).map(d => d.user_email)));
      if (emails.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("email, referral_code, name")
          .in("email", emails);
        if (profs) {
          setRefMap(prev => {
            const next = { ...prev };
            (profs as any[]).forEach(p => { next[p.email] = { code: p.referral_code, name: p.name }; });
            return next;
          });
        }
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchContributions(0); }, [fetchContributions]);

  const mask = (e: string) => e.replace(/(.{3}).*(@.*)/, "$1***$2");
  const formatRelative = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d`;
    return new Date(iso).toLocaleDateString();
  };

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
            <div className="space-y-3">
              {contributions.map((c) => {
                const tweetId = extractTweetId(c.post_url);
                const score = c.manual_score ?? c.ai_score;
                const prof = refMap[c.user_email] || {};
                const code = prof.code;
                const hasSavedText = !!c.post_text && c.post_text.trim().length > 0;
                const parsed = hasSavedText ? splitPostMeta(c.post_text!) : { body: "", meta: null as string | null, author: null as string | null, handle: null as string | null };
                const { body, meta } = parsed;
                const displayName = parsed.author || c.post_author || prof.name || mask(c.user_email);
                const handle = parsed.handle || extractHandleFromUrl(c.post_url);
                const initial = (displayName || "?").replace(/^@/, "").trim().charAt(0).toUpperCase();

                return (
                  <Card key={c.id} className="overflow-hidden">
                    <CardContent className="p-3 sm:p-4">
                      {/* Header section: avatar + name/handle + tags */}
                      <div className="flex items-center gap-2.5">
                        {code ? (
                          <Link to={`/u/${code}`} className="shrink-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary flex items-center justify-center text-sm font-semibold ring-1 ring-border">
                              {initial}
                            </div>
                          </Link>
                        ) : (
                          <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary flex items-center justify-center text-sm font-semibold ring-1 ring-border">
                            {initial}
                          </div>
                        )}
                        <div className="flex-1 min-w-0 leading-tight">
                          {code ? (
                            <Link to={`/u/${code}`} className="text-[13px] font-semibold text-foreground hover:underline truncate block">
                              {displayName}
                            </Link>
                          ) : (
                            <span className="text-[13px] font-semibold text-foreground truncate block">{displayName}</span>
                          )}
                          <div className="text-[11px] text-muted-foreground truncate">
                            {handle ? `@${handle}` : mask(c.user_email)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <TypeBadge type={c.content_type} />
                          <StatusBadge status={c.status} score={score} />
                        </div>
                      </div>

                      {/* Content — starts from the left edge */}
                      <div className="mt-2.5">
                        {hasSavedText ? (
                          <p className="text-[13.5px] leading-snug text-foreground whitespace-pre-wrap break-words">
                            {body}
                          </p>
                        ) : tweetId ? (
                          <TweetEmbed tweetId={tweetId} postUrl={c.post_url} />
                        ) : (
                          <a href={c.post_url} target="_blank" rel="noopener noreferrer"
                            className="block p-2 rounded-md bg-muted/50 hover:bg-muted text-xs text-primary break-all">
                            {c.post_url}
                          </a>
                        )}

                        {c.post_image_url && (
                          <a href={c.post_url} target="_blank" rel="noopener noreferrer" className="block mt-2">
                            <img
                              src={c.post_image_url}
                              alt="Post media"
                              loading="lazy"
                              className="w-full rounded-lg border border-border max-h-80 object-cover"
                            />
                          </a>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-2 pt-1.5 flex items-center justify-between text-[10.5px] text-muted-foreground">
                        <div className="flex items-center gap-1 min-w-0 truncate">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {hasSavedText && meta ? meta : formatRelative(c.created_at)}
                          </span>
                        </div>
                        <a href={c.post_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:text-primary shrink-0">
                          Open <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {c.ai_feedback && (
                        <div className="mt-1.5 px-2 py-1.5 rounded-md bg-muted/40 text-[10.5px] text-muted-foreground">
                          <span className="font-medium text-foreground">AI:</span> {c.ai_feedback}
                        </div>
                      )}
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
