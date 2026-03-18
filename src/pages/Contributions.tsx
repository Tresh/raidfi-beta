import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Send, LogOut, ExternalLink, Heart, Trophy, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Session } from "@supabase/supabase-js";

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
      
      // Clear previous content
      containerRef.current.innerHTML = '';
      
      const twttr = (window as any).twttr;
      if (twttr?.widgets?.createTweet) {
        twttr.widgets.createTweet(tweetId, containerRef.current, {
          theme: 'dark',
          dnt: true,
        }).then(() => {
          setLoading(false);
        }).catch(() => {
          // Fallback to link on error
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    };

    // Load Twitter widget script if not loaded
    if (!(window as any).twttr) {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = () => {
        (window as any).twttr?.ready?.(renderTweet);
      };
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
          <a href={postUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-muted-foreground hover:text-primary">
            Open post
          </a>
        </div>
      )}
    </div>
  );
};

const Contributions = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth form
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Post submission
  const [postUrl, setPostUrl] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);

  // Feed
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  // Points
  const [userPoints, setUserPoints] = useState(0);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [leaderboardFilter, setLeaderboardFilter] = useState<"all" | "day" | "week" | "month">("all");
  const [leaderboardPage, setLeaderboardPage] = useState(0);
  const [hasMoreLeaderboard, setHasMoreLeaderboard] = useState(true);
  const LEADERBOARD_PAGE_SIZE = 20;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchContributions = useCallback(async (pageNum: number, append = false) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("contributions")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Failed to fetch contributions:", error);
      return;
    }

    if (data) {
      setContributions(prev => append ? [...prev, ...data] : data);
      setHasMore(data.length === PAGE_SIZE);
    }
    setLoadingFeed(false);
  }, []);

  const fetchLeaderboard = useCallback(async (filter: "all" | "day" | "week" | "month", pageNum: number, append = false) => {
    if (!append) setLoadingLeaderboard(true);
    
    let query = supabase
      .from("contributions")
      .select("user_email, points_earned, created_at");

    // Apply time filter
    if (filter !== "all") {
      const now = new Date();
      let startDate: Date;
      if (filter === "day") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (filter === "week") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      query = query.gte("created_at", startDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch leaderboard:", error);
      setLoadingLeaderboard(false);
      return;
    }

    if (data) {
      const userPointsMap: Record<string, number> = {};
      data.forEach((c) => {
        userPointsMap[c.user_email] = (userPointsMap[c.user_email] || 0) + c.points_earned;
      });

      const sorted = Object.entries(userPointsMap)
        .map(([user_email, total_points]) => ({ user_email, total_points }))
        .sort((a, b) => b.total_points - a.total_points);

      const from = pageNum * LEADERBOARD_PAGE_SIZE;
      const to = from + LEADERBOARD_PAGE_SIZE;
      const paged = sorted.slice(from, to);

      if (append) {
        setLeaderboard(prev => [...prev, ...paged]);
      } else {
        setLeaderboard(paged);
      }
      setHasMoreLeaderboard(to < sorted.length);
    }
    setLoadingLeaderboard(false);
  }, []);

  useEffect(() => {
    fetchContributions(0);
  }, [fetchContributions]);

  useEffect(() => {
    setLeaderboardPage(0);
    fetchLeaderboard(leaderboardFilter, 0);
  }, [leaderboardFilter, fetchLeaderboard]);

  // Fetch user points
  useEffect(() => {
    if (!session?.user?.email) return;
    const fetchPoints = async () => {
      const { data } = await supabase
        .from("contributions")
        .select("points_earned")
        .eq("user_email", session.user.email!);
      
      if (data) {
        const total = data.reduce((sum, c) => sum + c.points_earned, 0);
        setUserPoints(total);
      }
    };
    fetchPoints();
  }, [session, contributions]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmittingAuth(true);

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setOtpSent(true);
      toast({ title: "Check your email", description: "We've sent you a 6-digit code to sign in." });
    }
    setSubmittingAuth(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setSubmittingAuth(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setSubmittingAuth(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setOtpSent(false);
    setOtp("");
    setEmail("");
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postUrl || !session?.user) return;

    if (!TWEET_URL_REGEX.test(postUrl)) {
      toast({ title: "Invalid URL", description: "Please paste a valid X (Twitter) post link.", variant: "destructive" });
      return;
    }

    setSubmittingPost(true);

    try {
      // Call AI verification edge function
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
        "verify-contribution",
        { body: { post_url: postUrl.trim() } }
      );

      if (verifyError) {
        console.error("Verify error:", verifyError);
      }

      const points = verifyData?.points_earned ?? 10;
      const aiFeedback = verifyData?.feedback ?? null;
      const aiScore = verifyData?.score_modifier != null ? 10 + verifyData.score_modifier : 10;
      const verdict = verifyData?.verdict ?? "acceptable";

      const { error } = await supabase.from("contributions").insert({
        user_email: session.user.email!,
        user_id: session.user.id,
        post_url: postUrl.trim(),
        points_earned: points,
        ai_score: aiScore,
        ai_feedback: aiFeedback,
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        const verdictEmoji = verdict === "excellent" ? "🔥" : verdict === "good" ? "👍" : verdict === "spam" ? "🚫" : verdict === "low_effort" ? "⚠️" : verdict === "ai_generated" ? "🤖" : "✅";
        toast({
          title: `${verdictEmoji} +${points} RaidFi Points`,
          description: aiFeedback || "Post submitted successfully!",
        });
        setPostUrl("");
        setPage(0);
        fetchContributions(0);
        fetchLeaderboard(leaderboardFilter, 0);
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    }

    setSubmittingPost(false);
  };

  const handleEngage = async (contribution: Contribution) => {
    if (!session?.user) {
      // Open the post URL even for non-authenticated users
      window.open(contribution.post_url, "_blank", "noopener,noreferrer");
      return;
    }

    // Track engagement
    const { error } = await supabase.from("contribution_engagements").insert({
      contribution_id: contribution.id,
      user_email: session.user.email!,
      user_id: session.user.id,
    });

    if (!error) {
      // Update engagement count
      await supabase
        .from("contributions")
        .update({ engagement_count: contribution.engagement_count + 1 })
        .eq("id", contribution.id);
      
      // Refresh feed
      fetchContributions(0);
    }

    window.open(contribution.post_url, "_blank", "noopener,noreferrer");
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchContributions(nextPage, true);
  };

  const loadMoreLeaderboard = () => {
    const nextPage = leaderboardPage + 1;
    setLeaderboardPage(nextPage);
    fetchLeaderboard(leaderboardFilter, nextPage, true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Community <span className="text-gradient">Contributions</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
              Share your RaidFi posts from X. Engage with the community. Earn points.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            {/* Feed Column */}
            <div className="space-y-4 order-2 lg:order-1">
              <h2 className="text-lg font-semibold text-foreground">Live Feed</h2>

              {loadingFeed ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : contributions.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No posts yet. Be the first to contribute!</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {contributions.map((c) => {
                    const tweetId = extractTweetId(c.post_url);
                    return (
                      <Card key={c.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">
                              {c.user_email.replace(/(.{3}).*(@.*)/, "$1***$2")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(c.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          {tweetId ? (
                            <TweetEmbed tweetId={tweetId} postUrl={c.post_url} />
                          ) : (
                            <a
                              href={c.post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm text-primary break-all"
                            >
                              {c.post_url}
                            </a>
                          )}

                          {/* AI Feedback */}
                          {c.ai_feedback && (
                            <div className="mt-2 px-3 py-2 rounded-md bg-muted/50 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">AI Review:</span>{" "}
                              {c.ai_feedback}
                              {c.ai_score != null && (
                                <span className={`ml-2 font-semibold ${c.ai_score >= 10 ? "text-green-500" : c.ai_score >= 8 ? "text-foreground" : "text-yellow-500"}`}>
                                  ({c.points_earned} pts)
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                            <button
                              onClick={() => handleEngage(c)}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Heart className="w-3.5 h-3.5" />
                              <span>Engage</span>
                            </button>
                            <span className="text-xs text-muted-foreground">
                              {c.engagement_count} engagement{c.engagement_count !== 1 ? "s" : ""}
                            </span>
                            <a
                              href={c.post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors ml-auto"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Open</span>
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {hasMore && (
                    <div className="text-center pt-4">
                      <Button variant="outline" size="sm" onClick={loadMore}>
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Leaderboard */}
              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Top Contributors
                  </h2>
                  <div className="flex items-center gap-1">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <div className="flex gap-1">
                      {(["all", "day", "week", "month"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setLeaderboardFilter(f)}
                          className={`px-2 py-1 text-xs rounded-md transition-colors ${
                            leaderboardFilter === f
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {f === "all" ? "All" : f === "day" ? "24h" : f === "week" ? "7d" : "30d"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {loadingLeaderboard ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : leaderboard.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No contributors yet.</p>
                ) : (
                  <>
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y divide-border">
                          {leaderboard.map((entry, index) => (
                            <div
                              key={entry.user_email}
                              className="flex items-center justify-between px-4 py-3"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index === 0 ? "bg-yellow-500/20 text-yellow-500" :
                                  index === 1 ? "bg-gray-400/20 text-gray-400" :
                                  index === 2 ? "bg-orange-500/20 text-orange-500" :
                                  "bg-muted text-muted-foreground"
                                }`}>
                                  {leaderboardPage * LEADERBOARD_PAGE_SIZE + index + 1}
                                </span>
                                <span className="text-sm text-foreground">
                                  {entry.user_email.replace(/(.{3}).*(@.*)/, "$1***$2")}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-primary">
                                {entry.total_points} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    {hasMoreLeaderboard && (
                      <div className="text-center pt-4">
                        <Button variant="outline" size="sm" onClick={loadMoreLeaderboard}>
                          Load More
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 order-1 lg:order-2">
              {authLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : !session ? (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Sign in to contribute</h3>
                    {!otpSent ? (
                      <form onSubmit={handleSendOtp} className="space-y-3">
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-10 text-sm"
                        />
                        <Button type="submit" className="w-full h-9 text-xs" disabled={submittingAuth}>
                          {submittingAuth && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
                          Send Code
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOtp} className="space-y-3">
                        <p className="text-xs text-muted-foreground">
                          Enter the code sent to <span className="text-foreground font-medium">{email}</span>
                        </p>
                        <Input
                          type="text"
                          placeholder="Enter OTP code"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          className="h-10 text-sm text-center tracking-widest"
                          maxLength={8}
                        />
                        <Button type="submit" className="w-full h-9 text-xs" disabled={submittingAuth}>
                          {submittingAuth && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
                          Verify
                        </Button>
                        <button
                          type="button"
                          onClick={() => { setOtpSent(false); setOtp(""); }}
                          className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
                        >
                          Use different email
                        </button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* User info card */}
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {session.user.email}
                        </span>
                        <button
                          onClick={handleSignOut}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <LogOut className="w-3 h-3" />
                          Sign out
                        </button>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">{userPoints} Points</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit post */}
                  <Card>
                    <CardContent className="p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Submit a post</h3>
                      <form onSubmit={handleSubmitPost} className="space-y-3">
                        <Input
                          type="url"
                          placeholder="https://x.com/user/status/..."
                          value={postUrl}
                          onChange={(e) => setPostUrl(e.target.value)}
                          required
                          className="h-10 text-sm"
                        />
                        <Button type="submit" className="w-full h-9 text-xs" disabled={submittingPost}>
                          {submittingPost ? (
                            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3 mr-1.5" />
                          )}
                          Submit Post (+10 pts)
                        </Button>
                      </form>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        Paste your X post link about RaidFi to earn points.
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contributions;
