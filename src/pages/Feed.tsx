import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ExternalLink, Star, Clock, FolderKanban } from "lucide-react";
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
  user_id?: string | null;
  referral_code?: string | null;
  author_name?: string | null;
}

const FeedImage = ({ postUrl }: { postUrl: string }) => {
  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [done, setDone] = useState(false); // finished resolving
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) setDone(true);
    }, 6000);

    (async () => {
      try {
        const { data } = await supabase.functions.invoke("fetch-post-image", { body: { post_url: postUrl } });
        if (cancelled) return;
        if (data?.post_image_url) {
          setSrc(data.post_image_url);
        } else {
          setDone(true);
        }
      } catch {
        if (!cancelled) setDone(true);
      } finally {
        window.clearTimeout(timeout);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [postUrl]);

  if (done && !src) return null;
  if (errored) return null;

  return (
    <a href={postUrl} target="_blank" rel="noopener noreferrer" className="block mt-2 relative">
      {src && (
        <img
          src={src}
          alt="Post media"
          onLoad={() => {
            setLoaded(true);
            setDone(true);
          }}
          onError={() => {
            setErrored(true);
            setDone(true);
          }}
          className={`w-full rounded-lg border border-border max-h-80 object-cover transition-opacity ${loaded ? "opacity-100 relative" : "opacity-0 absolute inset-0 pointer-events-none"}`}
        />
      )}
      {(!src || !loaded) && (
        <div className="w-full aspect-[16/10] rounded-lg border border-border bg-muted animate-pulse" />
      )}
    </a>
  );
};

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

import { useSEO } from "@/hooks/useSEO";

const Feed = () => {
  useSEO({
    title: "Explore — RaidFi",
    description: "Explore quality Web3 contributions, reputation signals, and projects on RaidFi.",
    path: "/explore",
  });
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState<"contributions" | "projects">("contributions");
  const [projects, setProjects] = useState<any[]>([]);
  const PAGE_SIZE = 20;

  const fetchContributions = useCallback(async (pageNum: number, append = false) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data } = await supabase
      .from("contributions_feed" as any)
      .select("id,post_url,points_earned,created_at,status,content_type,manual_score,ai_score,ai_feedback,post_text,post_author,user_id,referral_code,author_name")
      .eq("published_to_feed", true)
      .neq("status", "rejected")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (data) {
      const ranked = [...(data as unknown as Contribution[])].sort((a, b) => {
        const scoreA = a.manual_score ?? a.ai_score ?? 0;
        const scoreB = b.manual_score ?? b.ai_score ?? 0;
        const ageA = Math.max(0, (Date.now() - new Date(a.created_at).getTime()) / 86_400_000);
        const ageB = Math.max(0, (Date.now() - new Date(b.created_at).getTime()) / 86_400_000);
        const qualityA = scoreA * 8 + Math.log1p(Math.max(0, a.points_earned)) * 4 - Math.min(ageA, 30) * 0.35;
        const qualityB = scoreB * 8 + Math.log1p(Math.max(0, b.points_earned)) * 4 - Math.min(ageB, 30) * 0.35;
        return qualityB - qualityA;
      });
      setContributions(prev => append ? [...prev, ...ranked] : ranked);
      setHasMore(data.length === PAGE_SIZE);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContributions(0);
    supabase.from("projects" as any).select("id,name,slug,website,x_handle,description,verification,trust_score").eq("status", "active").order("trust_score", { ascending: false }).limit(20).then(({ data }) => setProjects((data as any[]) ?? []));
  }, [fetchContributions]);

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "CollectionPage", "name": "Explore — RaidFi", "description": "Quality Web3 contributions and projects on RaidFi.", "url": "https://raidfi.site/explore" }) }} />
      <main className="flex-1 pt-16 pb-24 md:pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
          <div className="sticky top-14 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 bg-background/90 backdrop-blur border-b border-border mb-3">
            <div className="flex gap-1 py-2">
              <button
                onClick={() => setTab("contributions")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === "contributions" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                For you
              </button>
              <button
                onClick={() => setTab("projects")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === "projects" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Projects
              </button>
            </div>
          </div>

          {tab === "projects" ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {projects.length ? projects.map((project) => (
                <Card key={project.id}><CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-semibold">{project.name}</h2><p className="text-[11px] text-muted-foreground">{project.verification} · Trust {project.trust_score}</p></div><FolderKanban className="w-4 h-4 text-primary" /></div>
                  {project.description && <p className="text-xs text-muted-foreground mt-3 line-clamp-3">{project.description}</p>}
                  <div className="mt-3 flex gap-3 text-xs">{project.website && <a href={project.website} target="_blank" rel="noreferrer" className="text-primary">Website</a>}{project.x_handle && <a href={`https://x.com/${project.x_handle.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="text-primary">@{project.x_handle.replace(/^@/, "")}</a>}</div>
                </CardContent></Card>
              )) : <p className="text-sm text-muted-foreground py-10 text-center col-span-2">Project listings will appear here after verification.</p>}
            </div>
          ) : loading ? (

            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : contributions.length === 0 ? (
            <Card className="border-dashed"><CardContent className="py-12 text-center"><p className="text-muted-foreground">No posts yet.</p></CardContent></Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 items-start">
              {contributions.map((c) => {
                const tweetId = extractTweetId(c.post_url);
                const score = c.manual_score ?? c.ai_score;
                const code = c.referral_code;
                const hasSavedText = !!c.post_text && c.post_text.trim().length > 0;
                const parsed = hasSavedText ? splitPostMeta(c.post_text!) : { body: "", meta: null as string | null, author: null as string | null, handle: null as string | null };
                const { body, meta } = parsed;
                const displayName = parsed.author || c.post_author || c.author_name || "Anonymous";
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
                            {handle ? `@${handle}` : ""}
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

                        {extractTweetId(c.post_url) && <FeedImage postUrl={c.post_url} />}
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
