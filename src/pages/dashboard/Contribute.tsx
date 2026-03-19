import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Send, ExternalLink, Heart, Trophy, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const TWEET_URL_REGEX = /^https?:\/\/(x\.com|twitter\.com)\/\w+\/status\/(\d+)/;

const extractTweetId = (url: string): string | null => {
  const match = url.match(TWEET_URL_REGEX);
  return match ? match[2] : null;
};

interface Contribution {
  id: string;
  user_email: string;
  post_url: string;
  points_earned: number;
  engagement_count: number;
  created_at: string;
  ai_score?: number;
  ai_feedback?: string;
  status?: string;
}

interface LeaderboardEntry {
  user_email: string;
  total_points: number;
}

const TweetEmbed = ({ tweetId, postUrl }: { tweetId: string; postUrl: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const renderTweet = () => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = '';
      const twttr = (window as any).twttr;
      if (twttr?.widgets?.createTweet) {
        twttr.widgets.createTweet(tweetId, containerRef.current, { theme: 'dark', dnt: true })
          .then(() => setLoading(false))
          .catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    };

    if (!(window as any).twttr) {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = () => { (window as any).twttr?.ready?.(renderTweet); };
      document.head.appendChild(script);
    } else {
      (window as any).twttr.ready?.(renderTweet) || renderTweet();
    }
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

const Contribute = () => {
  const { toast } = useToast();
  const { session } = useAuth();

  const [postUrl, setPostUrl] = useState("");
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

  const fetchContributions = useCallback(async (pageNum: number, append = false) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("contributions")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) { console.error(error); return; }
    if (data) {
      setContributions(prev => append ? [...prev, ...data] : data);
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
      data.forEach(c => { map[c.user_email] = (map[c.user_email] || 0) + c.points_earned; });
      const sorted = Object.entries(map).map(([user_email, total_points]) => ({ user_email, total_points })).sort((a, b) => b.total_points - a.total_points);
      const from = pageNum * LEADERBOARD_PAGE_SIZE;
      const paged = sorted.slice(from, from + LEADERBOARD_PAGE_SIZE);
      setLeaderboard(append ? prev => [...prev, ...paged] : paged);
      setHasMoreLeaderboard(from + LEADERBOARD_PAGE_SIZE < sorted.length);
    }
    setLoadingLeaderboard(false);
  }, []);

  useEffect(() => { fetchContributions(0); }, [fetchContributions]);
  useEffect(() => { setLeaderboardPage(0); fetchLeaderboard(leaderboardFilter, 0); }, [leaderboardFilter, fetchLeaderboard]);

  useEffect(() => {
    if (!session?.user?.email) return;
    const fetchPoints = async () => {
      const { data } = await supabase.from("contributions").select("points_earned").eq("user_email", session.user.email!);
      if (data) setUserPoints(data.reduce((sum, c) => sum + c.points_earned, 0));
    };
    fetchPoints();
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
      const { error } = await supabase.from("contributions").insert({
        id: contributionId,
        user_email: session.user.email!,
        user_id: session.user.id,
        post_url: postUrl.trim(),
        points_earned: 10,
        status: "pending",
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "⏳ Post Submitted", description: "Pending admin approval." });
        supabase.functions.invoke("notify-admin-contribution", {
          body: { post_url: postUrl.trim(), user_email: session.user.email, contribution_id: contributionId },
        }).catch(console.error);
        setPostUrl("");
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    }
    setSubmittingPost(false);
  };

  const handleEngage = async (contribution: Contribution) => {
    if (session?.user) {
      await supabase.from("contribution_engagements").insert({
        contribution_id: contribution.id,
        user_email: session.user.email!,
        user_id: session.user.id,
      });
      await supabase.from("contributions").update({ engagement_count: contribution.engagement_count + 1 }).eq("id", contribution.id);
      fetchContributions(0);
    }
    window.open(contribution.post_url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Contribute</h1>
        <p className="text-sm text-muted-foreground">Share your RaidFi posts from X. Earn points.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Feed */}
        <div className="space-y-4">
          {/* Submit */}
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handleSubmitPost} className="flex gap-3">
                <Input
                  type="url"
                  placeholder="https://x.com/user/status/..."
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  required
                  className="h-10 text-sm flex-1"
                />
                <Button type="submit" className="h-10 px-4 text-sm shrink-0" disabled={submittingPost}>
                  {submittingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
              <p className="text-[11px] text-muted-foreground mt-2">Posts require admin approval before appearing.</p>
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
                return (
                  <Card key={c.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">{c.user_email.replace(/(.{3}).*(@.*)/, "$1***$2")}</span>
                        <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
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
                        <button onClick={() => handleEngage(c)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <Heart className="w-3.5 h-3.5" /><span>Engage</span>
                        </button>
                        <span className="text-xs text-muted-foreground">{c.engagement_count} engagement{c.engagement_count !== 1 ? "s" : ""}</span>
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

          {/* Leaderboard */}
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
