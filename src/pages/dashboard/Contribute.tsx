import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Send, ExternalLink, Trophy, Clock, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  ai_score?: number | null;
  ai_feedback?: string | null;
}

interface LeaderboardEntry { user_email: string; total_points: number; }

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
        ✓ {score != null ? score : "Approved"}
        {score != null && score > 10 && <Star className="w-2.5 h-2.5 fill-current" />}
      </span>
    );
  }
  if (status === "rejected") return <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">Rejected</span>;
  return <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 font-medium">⏳ Awaiting score</span>;
};

const Contribute = () => {
  const { toast } = useToast();
  const { session } = useAuth();

  const [postUrl, setPostUrl] = useState("");
  const [contentType, setContentType] = useState("post");
  const [contentTypes, setContentTypes] = useState<{ value: string; label: string; default_points?: number }[]>([]);
  const [scoringDelay, setScoringDelay] = useState(24);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;
  const [userPoints, setUserPoints] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [leaderboardFilter, setLeaderboardFilter] = useState<"all" | "day" | "week" | "month">("all");
  const [leaderboardPage, setLeaderboardPage] = useState(0);
  const [hasMoreLeaderboard, setHasMoreLeaderboard] = useState(true);
  const LEADERBOARD_PAGE_SIZE = 20;

  useEffect(() => {
    (async () => {
      const [{ data: types }, { data: settings }] = await Promise.all([
        supabase.from("content_types" as any).select("*").eq("is_active", true).order("sort_order"),
        supabase.from("admin_settings" as any).select("scoring_delay_hours").eq("id", "global").maybeSingle(),
      ]);
      setContentTypes((types as any) || []);
      if ((settings as any)?.scoring_delay_hours) setScoringDelay((settings as any).scoring_delay_hours);
    })();
  }, []);

  const fetchContributions = useCallback(async (pageNum: number, append = false) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("contributions")
      .select("id,user_email,post_url,points_earned,created_at,status,content_type,manual_score,ai_score,ai_feedback")
      .eq("published_to_feed", true)
      .neq("status", "rejected")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) { console.error(error); return; }
    if (data) {
      setContributions(prev => append ? [...prev, ...(data as any)] : (data as any));
      setHasMore(data.length === PAGE_SIZE);
    }
    setLoadingFeed(false);
  }, []);

  const fetchLeaderboard = useCallback(async (filter: "all" | "day" | "week" | "month", pageNum: number, append = false) => {
    if (!append) setLoadingLeaderboard(true);
    let query = supabase.from("contributions").select("user_email, points_earned, created_at").eq("status", "approved");
    if (filter !== "all") {
      const now = new Date();
      let startDate: Date;
      if (filter === "day") startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      else if (filter === "week") startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      else startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      query = query.gte("created_at", startDate.toISOString());
    }
    const { data } = await query;
    if (data) {
      const map: Record<string, number> = {};
      data.forEach((c: any) => { map[c.user_email] = (map[c.user_email] || 0) + c.points_earned; });
      const sorted = Object.entries(map).map(([user_email, total_points]) => ({ user_email, total_points })).sort((a, b) => b.total_points - a.total_points);
      const from = pageNum * LEADERBOARD_PAGE_SIZE;
      const paged = sorted.slice(from, from + LEADERBOARD_PAGE_SIZE);
      setLeaderboard(append ? [...leaderboard, ...paged] : paged);
      setHasMoreLeaderboard(from + LEADERBOARD_PAGE_SIZE < sorted.length);
    }
    setLoadingLeaderboard(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchContributions(0); }, [fetchContributions]);
  useEffect(() => { setLeaderboardPage(0); fetchLeaderboard(leaderboardFilter, 0); }, [leaderboardFilter, fetchLeaderboard]);

  useEffect(() => {
    if (!session?.user?.email) return;
    (async () => {
      const { data } = await supabase.from("contributions").select("points_earned").eq("user_email", session.user.email!).eq("status", "approved");
      if (data) setUserPoints(data.reduce((sum: number, c: any) => sum + c.points_earned, 0));
    })();
  }, [session, contributions]);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postUrl || !session?.user) return;
    if (!TWEET_URL_REGEX.test(postUrl)) {
      toast({ title: "Invalid URL", description: "Please paste a valid X post link.", variant: "destructive" });
      return;
    }
    setSubmittingPost(true);
    try {
      const contributionId = crypto.randomUUID();
      const ct = contentTypes.find(t => t.value === contentType);
      const points = ct?.default_points ?? 10;
      const { error } = await supabase.from("contributions").insert({
        id: contributionId,
        user_email: session.user.email!,
        user_id: session.user.id,
        post_url: postUrl.trim(),
        content_type: contentType,
        points_earned: points,
        status: "pending",
      } as any);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "⏳ Submitted", description: `Scored within ${scoringDelay}h.` });
        // Fetch text in background
        supabase.functions.invoke("fetch-post-text", {
          body: { contribution_id: contributionId, post_url: postUrl.trim() },
        }).catch(console.error);
        // Notify admins
        supabase.functions.invoke("notify-admin-contribution", {
          body: { post_url: postUrl.trim(), user_email: session.user.email, contribution_id: contributionId },
        }).catch(console.error);
        // Notify telegram (will be skipped if disabled). Function fetches contribution + post text itself.
        supabase.functions.invoke("notify-telegram", {
          body: { kind: "feed", contribution_id: contributionId, origin: window.location.origin },
        }).catch(console.error);
        setPostUrl("");
        fetchContributions(0);
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    }
    setSubmittingPost(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Contribute</h1>
        <p className="text-sm text-muted-foreground">Share your RaidFi content from X. Earn points.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-4">
          {/* Submit */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <form onSubmit={handleSubmitPost} className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <select value={contentType} onChange={(e) => setContentType(e.target.value)}
                    className="h-10 text-sm rounded-md border border-input bg-background px-3 text-foreground">
                    {contentTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <Input type="url" placeholder="https://x.com/user/status/..." value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)} required className="h-10 text-sm flex-1 min-w-[200px]" />
                  <Button type="submit" className="h-10 px-4 text-sm" disabled={submittingPost}>
                    {submittingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </form>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Posts are scored within {scoringDelay} hours.
              </p>
            </CardContent>
          </Card>

          <h2 className="text-lg font-semibold text-foreground">Live Feed</h2>
          {loadingFeed ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : contributions.length === 0 ? (
            <Card className="border-dashed"><CardContent className="py-12 text-center"><p className="text-muted-foreground">No posts yet.</p></CardContent></Card>
          ) : (
            <>
              {contributions.map((c) => {
                const tweetId = extractTweetId(c.post_url);
                const score = c.manual_score ?? c.ai_score ?? null;
                return (
                  <Card key={c.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{c.user_email.replace(/(.{3}).*(@.*)/, "$1***$2")}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">{c.content_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={c.status} score={score} />
                          <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {tweetId ? <TweetEmbed tweetId={tweetId} postUrl={c.post_url} /> : (
                        <a href={c.post_url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg bg-muted/50 hover:bg-muted text-sm text-primary break-all">{c.post_url}</a>
                      )}
                      {c.ai_feedback && (
                        <div className="mt-2 px-3 py-2 rounded-md bg-muted/50 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">AI Review:</span> {c.ai_feedback}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                        <a href={c.post_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors ml-auto">
                          <ExternalLink className="w-3.5 h-3.5" /><span>Open</span>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {hasMore && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm" onClick={() => { const np = page + 1; setPage(np); fetchContributions(np, true); }}>Load More</Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{userPoints} Points</span>
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" /> Top Contributors
              </h3>
              <div className="flex gap-1">
                {(["all", "day", "week", "month"] as const).map(f => (
                  <button key={f} onClick={() => setLeaderboardFilter(f)}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${leaderboardFilter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                    {f === "all" ? "All" : f === "day" ? "24h" : f === "week" ? "7d" : "30d"}
                  </button>
                ))}
              </div>
            </div>
            {loadingLeaderboard ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contributors yet.</p>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {leaderboard.map((entry, index) => (
                      <div key={entry.user_email} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? "bg-yellow-500/20 text-yellow-500" : index === 1 ? "bg-gray-400/20 text-gray-400" : index === 2 ? "bg-orange-500/20 text-orange-500" : "bg-muted text-muted-foreground"
                          }`}>{leaderboardPage * LEADERBOARD_PAGE_SIZE + index + 1}</span>
                          <span className="text-sm text-foreground">{entry.user_email.replace(/(.{3}).*(@.*)/, "$1***$2")}</span>
                        </div>
                        <span className="text-sm font-semibold text-primary">{entry.total_points} pts</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contribute;
