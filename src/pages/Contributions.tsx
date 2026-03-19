import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2, Send, LogOut, Trophy, Copy, Check, ExternalLink,
  Mail, KeyRound, User, Link2, ClipboardList
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Session } from "@supabase/supabase-js";

const TWEET_URL_REGEX = /^https?:\/\/(x\.com|twitter\.com)\/\w+\/status\/(\d+)/;

interface Profile {
  id: string;
  user_id: string;
  email: string;
  referral_code: string;
  referral_count: number;
  name: string | null;
  total_points: number;
  waitlist_completed: boolean;
}

interface ContributeTask {
  id: string;
  label: string;
  description: string | null;
  points: number;
  task_type: string;
  url: string | null;
}

interface LeaderboardEntry {
  display_name: string;
  email: string;
  total_points: number;
}

const Contributions = () => {
  const { toast } = useToast();

  // Auth
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Profile
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Post submission
  const [postUrl, setPostUrl] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);

  // Contribute tasks
  const [contributeTasks, setContributeTasks] = useState<ContributeTask[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [leaderboardFilter, setLeaderboardFilter] = useState<"all" | "day" | "week" | "month">("all");
  const [leaderboardVisible, setLeaderboardVisible] = useState(10);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userTotalPoints, setUserTotalPoints] = useState(0);
  const [allLeaderboard, setAllLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Referral copy
  const [copied, setCopied] = useState(false);

  // Auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setAuthLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile when session changes
  useEffect(() => {
    if (!session?.user) { setProfile(null); return; }
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data) {
        // Fix missing referral_code
        if (!(data as any).referral_code) {
          const { data: updated } = await supabase
            .from("profiles")
            .update({ referral_code: undefined } as any) // triggers default
            .eq("user_id", session.user.id)
            .select()
            .single();
          setProfile(updated as any);
        } else {
          setProfile(data as any);
        }
      } else {
        // Create profile if missing
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert({
            user_id: session.user.id,
            email: session.user.email!,
            waitlist_completed: true,
          })
          .select()
          .single();
        if (newProfile) setProfile(newProfile as any);
      }
    };
    fetchProfile();
  }, [session]);

  // Fetch contribute tasks
  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("contribute_tasks" as any)
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data) setContributeTasks(data as any);
    };
    fetch();
  }, []);

  // Fetch completed tasks
  useEffect(() => {
    if (!session?.user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("contribute_task_completions" as any)
        .select("task_id")
        .eq("user_id", session.user.id);
      if (data) setCompletedTaskIds(new Set((data as any[]).map(d => d.task_id)));
    };
    fetch();
  }, [session]);

  // Calculate user total points
  const calculatePoints = useCallback(async () => {
    if (!session?.user?.email) return;
    const userEmail = session.user.email;

    // Waitlist points
    const { data: wl } = await supabase
      .from("waitlist_submissions")
      .select("points")
      .eq("email", userEmail);
    const waitlistPts = wl?.reduce((s, r) => s + r.points, 0) || 0;

    // Validation points
    const { data: val } = await supabase
      .from("validation_submissions")
      .select("points_earned")
      .eq("email", userEmail);
    const valPts = val?.reduce((s, r) => s + r.points_earned, 0) || 0;

    // Contribution points (approved)
    const { data: cont } = await supabase
      .from("contributions")
      .select("points_earned")
      .eq("user_email", userEmail)
      .eq("status", "approved");
    const contPts = cont?.reduce((s, r) => s + r.points_earned, 0) || 0;

    // Contribute task points
    let taskPts = 0;
    if (session.user.id) {
      const { data: completions } = await supabase
        .from("contribute_task_completions" as any)
        .select("task_id")
        .eq("user_id", session.user.id);
      if (completions && contributeTasks.length) {
        const taskMap = new Map(contributeTasks.map(t => [t.id, t.points]));
        taskPts = (completions as any[]).reduce((s, c) => s + (taskMap.get(c.task_id) || 0), 0);
      }
    }

    setUserTotalPoints(waitlistPts + valPts + contPts + taskPts);
  }, [session, contributeTasks]);

  useEffect(() => { calculatePoints(); }, [calculatePoints]);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async (filter: typeof leaderboardFilter) => {
    setLoadingLeaderboard(true);

    // Get all contributions (approved)
    let query = supabase.from("contributions").select("user_email, points_earned, created_at").eq("status", "approved");
    if (filter !== "all") {
      const now = new Date();
      let start: Date;
      if (filter === "day") start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      else if (filter === "week") start = new Date(now.getTime() - 7 * 86400000);
      else start = new Date(now.getFullYear(), now.getMonth(), 1);
      query = query.gte("created_at", start.toISOString());
    }
    const { data: contData } = await query;

    // Get waitlist points
    const { data: wlData } = await supabase.from("waitlist_submissions").select("email, points");
    // Get validation points
    const { data: valData } = await supabase.from("validation_submissions").select("email, points_earned");
    // Get profiles for names
    const { data: profilesData } = await supabase.from("profiles").select("email, name") as any;

    const pointsMap: Record<string, number> = {};
    const namesMap: Record<string, string> = {};

    if (profilesData) {
      (profilesData as any[]).forEach(p => { if (p.name) namesMap[p.email] = p.name; });
    }

    // Only add base points for "all" filter
    if (filter === "all") {
      wlData?.forEach(w => { pointsMap[w.email] = (pointsMap[w.email] || 0) + w.points; });
      valData?.forEach(v => { pointsMap[v.email] = (pointsMap[v.email] || 0) + v.points_earned; });
    }

    contData?.forEach(c => { pointsMap[c.user_email] = (pointsMap[c.user_email] || 0) + c.points_earned; });

    const sorted = Object.entries(pointsMap)
      .map(([email, total_points]) => ({
        email,
        display_name: namesMap[email] || email.replace(/(.{3}).*(@.*)/, "$1***$2"),
        total_points,
      }))
      .sort((a, b) => b.total_points - a.total_points);

    setAllLeaderboard(sorted);
    setLeaderboard(sorted.slice(0, 10));
    setLeaderboardVisible(10);

    // Find user rank
    if (session?.user?.email) {
      const idx = sorted.findIndex(e => e.email === session.user.email);
      setUserRank(idx >= 0 ? idx + 1 : null);
    }

    setLoadingLeaderboard(false);
  }, [session]);

  useEffect(() => { fetchLeaderboard(leaderboardFilter); }, [leaderboardFilter, fetchLeaderboard]);

  // Auth handlers
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmittingAuth(true);

    const { data: emailExists } = await supabase.rpc("check_email_exists", {
      check_email: email.trim().toLowerCase(),
    });
    if (!emailExists) {
      toast({ title: "Not on the waitlist", description: "Complete the waitlist first.", variant: "destructive" });
      setSubmittingAuth(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase() });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setOtpSent(true);
      toast({ title: "Check your email", description: "We sent you a login code." });
    }
    setSubmittingAuth(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setSubmittingAuth(true);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: otp, type: "email" });
    if (error) toast({ title: "Invalid code", description: error.message, variant: "destructive" });
    setSubmittingAuth(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setOtpSent(false);
    setOtp("");
    setEmail("");
  };

  // Name save
  const handleSaveName = async () => {
    if (!nameInput.trim() || !session?.user) return;
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: nameInput.trim() } as any)
      .eq("user_id", session.user.id);
    if (!error) {
      setProfile(prev => prev ? { ...prev, name: nameInput.trim() } : prev);
      toast({ title: "Name saved!" });
    }
    setSavingName(false);
  };

  // Post submission
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
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    }
    setSubmittingPost(false);
  };

  // Copy referral
  const handleCopyReferral = () => {
    if (!profile?.referral_code) return;
    const link = `${window.location.origin}/waitlist?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Referral link copied to clipboard." });
  };

  // Complete contribute task
  const handleCompleteTask = async (task: ContributeTask) => {
    if (!session?.user) return;
    if (completedTaskIds.has(task.id)) return;

    if (task.task_type === "form" && task.url) {
      window.open(task.url, "_blank");
      return;
    }
    if (task.task_type === "link" && task.url) {
      window.open(task.url, "_blank");
    }

    const { error } = await supabase
      .from("contribute_task_completions" as any)
      .insert({ user_id: session.user.id, task_id: task.id } as any);
    if (!error) {
      setCompletedTaskIds(prev => new Set([...prev, task.id]));
      toast({ title: `+${task.points} Points`, description: task.label });
      calculatePoints();
    }
  };

  const loadMoreLeaderboard = () => {
    const next = leaderboardVisible + 10;
    setLeaderboard(allLeaderboard.slice(0, next));
    setLeaderboardVisible(next);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Community <span className="text-gradient">Contributions</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Share your RaidFi posts, complete tasks, and earn points.
            </p>
          </div>

          {authLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : !session ? (
            /* LOGIN GATE */
            <div className="max-w-sm mx-auto">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      {otpSent ? <KeyRound className="w-7 h-7 text-primary" /> : <Mail className="w-7 h-7 text-primary" />}
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {otpSent ? "Enter Code" : "Sign in to Contribute"}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      {otpSent
                        ? <>Code sent to <span className="text-foreground font-medium">{email}</span></>
                        : "Use your waitlist email to sign in."
                      }
                    </p>
                  </div>

                  {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-3">
                      <Input type="email" placeholder="you@example.com" value={email}
                        onChange={(e) => setEmail(e.target.value)} required className="h-10 text-sm" />
                      <Button type="submit" className="w-full h-9 text-xs" disabled={submittingAuth}>
                        {submittingAuth && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
                        Send Code
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Don't have access? <a href="/waitlist" className="text-primary hover:underline">Join the waitlist</a>
                      </p>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <Input type="text" placeholder="Enter code" value={otp}
                        onChange={(e) => setOtp(e.target.value)} required
                        className="h-10 text-sm text-center tracking-widest" maxLength={8} />
                      <Button type="submit" className="w-full h-9 text-xs" disabled={submittingAuth}>
                        {submittingAuth && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
                        Verify
                      </Button>
                      <button type="button" onClick={() => { setOtpSent(false); setOtp(""); }}
                        className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
                        Use different email
                      </button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            /* LOGGED IN */
            <div className="space-y-6">
              {/* Name prompt */}
              {profile && !profile.name && (
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-5 h-5 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">What's your name?</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">This will be shown on the leaderboard.</p>
                    <div className="flex gap-2">
                      <Input placeholder="Your name" value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)} className="h-9 text-sm flex-1" maxLength={50} />
                      <Button size="sm" onClick={handleSaveName} disabled={savingName || !nameInput.trim()}>
                        {savingName ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* User Stats + Sign Out */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                        {(profile?.name || session.user.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{profile?.name || session.user.email}</p>
                        {profile?.name && <p className="text-xs text-muted-foreground">{session.user.email}</p>}
                      </div>
                    </div>
                    <button onClick={handleSignOut} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <LogOut className="w-3 h-3" /> Sign out
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-primary/10 text-center">
                      <Trophy className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-lg font-bold text-foreground">{userTotalPoints}</p>
                      <p className="text-[10px] text-muted-foreground">Points</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted text-center">
                      <p className="text-lg font-bold text-foreground">{userRank ? `#${userRank}` : "—"}</p>
                      <p className="text-[10px] text-muted-foreground">Rank</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted text-center">
                      <p className="text-lg font-bold text-foreground">{profile?.referral_count || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Referrals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Referral */}
              {profile?.referral_code && (
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Link2 className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Your Referral Link</h3>
                    </div>
                    <div className="flex gap-2">
                      <Input readOnly value={`${window.location.origin}/waitlist?ref=${profile.referral_code}`}
                        className="h-9 text-xs flex-1 bg-muted" />
                      <Button size="sm" variant="outline" onClick={handleCopyReferral} className="h-9 px-3">
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Post Submission */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Send className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Submit a Post</h3>
                  </div>
                  <form onSubmit={handleSubmitPost} className="flex gap-2">
                    <Input type="url" placeholder="https://x.com/user/status/..." value={postUrl}
                      onChange={(e) => setPostUrl(e.target.value)} required className="h-9 text-sm flex-1" />
                    <Button type="submit" size="sm" className="h-9 px-4" disabled={submittingPost}>
                      {submittingPost ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    </Button>
                  </form>
                  <p className="text-[11px] text-muted-foreground mt-2">Posts require admin approval before earning points.</p>
                </CardContent>
              </Card>

              {/* Contribute Tasks */}
              {contributeTasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Tasks</h3>
                  </div>
                  <div className="space-y-2">
                    {contributeTasks.map(task => {
                      const done = completedTaskIds.has(task.id);
                      return (
                        <Card key={task.id} className={done ? "opacity-60" : ""}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-foreground">{task.label}</p>
                                {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-primary">+{task.points} pts</span>
                                <Button size="sm" variant={done ? "ghost" : "outline"} disabled={done}
                                  onClick={() => handleCompleteTask(task)} className="h-8 text-xs">
                                  {done ? <><Check className="w-3 h-3 mr-1" /> Done</> : "Complete"}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Leaderboard */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" /> Leaderboard
                  </h3>
                  <div className="flex gap-1">
                    {(["all", "day", "week", "month"] as const).map(f => (
                      <button key={f} onClick={() => setLeaderboardFilter(f)}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          leaderboardFilter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}>
                        {f === "all" ? "All" : f === "day" ? "24h" : f === "week" ? "7d" : "30d"}
                      </button>
                    ))}
                  </div>
                </div>

                {loadingLeaderboard ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                ) : leaderboard.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No contributors yet.</p>
                ) : (
                  <>
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y divide-border">
                          {leaderboard.map((entry, i) => {
                            const isUser = entry.email === session?.user?.email;
                            return (
                              <div key={entry.email} className={`flex items-center justify-between px-4 py-3 ${isUser ? "bg-primary/5" : ""}`}>
                                <div className="flex items-center gap-3">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    i === 0 ? "bg-yellow-500/20 text-yellow-500" :
                                    i === 1 ? "bg-gray-400/20 text-gray-400" :
                                    i === 2 ? "bg-orange-500/20 text-orange-500" :
                                    "bg-muted text-muted-foreground"
                                  }`}>{i + 1}</span>
                                  <span className={`text-sm ${isUser ? "text-primary font-medium" : "text-foreground"}`}>
                                    {entry.display_name} {isUser && "(You)"}
                                  </span>
                                </div>
                                <span className="text-sm font-semibold text-primary">{entry.total_points} pts</span>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* User position if not in view */}
                    {userRank && userRank > leaderboardVisible && (
                      <div className="mt-2 px-4 py-2 rounded-lg bg-primary/5 border border-primary/20 text-sm text-foreground flex justify-between">
                        <span>Your position: <strong>#{userRank}</strong></span>
                        <span className="font-semibold text-primary">{userTotalPoints} pts</span>
                      </div>
                    )}

                    {leaderboardVisible < allLeaderboard.length && (
                      <div className="text-center pt-3">
                        <Button variant="outline" size="sm" onClick={loadMoreLeaderboard}>See More</Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Link to feed */}
              <div className="text-center pt-4">
                <a href="/feed" className="text-sm text-primary hover:underline flex items-center gap-1 justify-center">
                  <ExternalLink className="w-3.5 h-3.5" /> View Live Feed
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contributions;
