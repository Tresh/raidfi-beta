import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2, Send, LogOut, Copy, Check, ExternalLink,
  Mail, KeyRound, User, Link2, ClipboardList, History
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ValidationForm from "@/components/validation/ValidationForm";
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
  is_pinned?: boolean;
  requires_link_submission?: boolean;
  submission_label?: string | null;
  submission_placeholder?: string | null;
  action_types?: string[];
  created_at?: string;
}

interface LeaderboardEntry {
  display_name: string;
  email: string;
  total_points: number; // period_xp (what we show as primary)
  total_xp?: number;
  overall_rank?: number;
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
  const [contentType, setContentType] = useState("post");
  const [contentTypes, setContentTypes] = useState<{ value: string; label: string; default_points?: number }[]>([]);
  const [scoringDelay, setScoringDelay] = useState(24);
  const [submittingPost, setSubmittingPost] = useState(false);

  // Contribute tasks
  const [contributeTasks, setContributeTasks] = useState<ContributeTask[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [taskLinks, setTaskLinks] = useState<Record<string, string>>({});

  // Validation form inline
  const [showValidationForm, setShowValidationForm] = useState(false);
  const [validationCompleted, setValidationCompleted] = useState(false);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [leaderboardFilter, setLeaderboardFilter] = useState<"all" | "day" | "week" | "month">("all");
  const [leaderboardVisible, setLeaderboardVisible] = useState(10);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userTotalPoints, setUserTotalPoints] = useState(0);
  const [allLeaderboard, setAllLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Activities
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activitiesVisible, setActivitiesVisible] = useState(5);
  const [allActivitiesCount, setAllActivitiesCount] = useState(0);

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
        if (!(data as any).referral_code) {
          const { data: updated } = await supabase
            .from("profiles")
            .update({ referral_code: undefined } as any)
            .eq("user_id", session.user.id)
            .select()
            .single();
          setProfile(updated as any);
        } else {
          setProfile(data as any);
        }
      } else {
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

  // Check if validation already completed
  useEffect(() => {
    if (!session?.user?.email) return;
    const check = async () => {
      const { data } = await supabase
        .from("validation_submissions")
        .select("id")
        .eq("email", session.user!.email!)
        .maybeSingle();
      if (data) setValidationCompleted(true);
    };
    check();
  }, [session]);

  // Fetch contribute tasks (pinned first, then newest first)
  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("contribute_tasks" as any)
        .select("*")
        .eq("is_active", true);
      if (data) {
        const sorted = ((data as any[]) || []).sort((a, b) => {
          if (!!a.is_pinned !== !!b.is_pinned) return a.is_pinned ? -1 : 1;
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
        setContributeTasks(sorted as any);
      }
    };
    fetch();
  }, []);

  // Fetch content types + settings
  useEffect(() => {
    (async () => {
      const [{ data: types }, { data: s }] = await Promise.all([
        supabase.from("content_types" as any).select("*").eq("is_active", true).order("sort_order"),
        supabase.from("admin_settings" as any).select("scoring_delay_hours").eq("id", "global").maybeSingle(),
      ]);
      setContentTypes((types as any) || []);
      if ((s as any)?.scoring_delay_hours) setScoringDelay((s as any).scoring_delay_hours);
    })();
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

  // User XP from backend score table
  const calculatePoints = useCallback(async () => {
    const userEmail = session?.user?.email?.trim().toLowerCase();
    if (!userEmail) {
      setUserTotalPoints(0);
      return;
    }

    const { data } = await (supabase
      .from("leaderboard_scores" as any)
      .select("total_xp")
      .eq("email", userEmail)
      .maybeSingle() as any);

    setUserTotalPoints((data?.total_xp as number) || 0);
  }, [session]);

  useEffect(() => { calculatePoints(); }, [calculatePoints]);

  // Leaderboard now comes from backend RPC (source of truth)
  const fetchLeaderboard = useCallback(async (filter: typeof leaderboardFilter) => {
    setLoadingLeaderboard(true);

    const { data, error } = await supabase.rpc("get_leaderboard", { _period: filter });

    if (error) {
      setAllLeaderboard([]);
      setLeaderboard([]);
      setUserRank(null);
      setLoadingLeaderboard(false);
      return;
    }

    const sorted: LeaderboardEntry[] = ((data || []) as any[]).map((row) => ({
      email: row.email,
      display_name: row.display_name,
      total_points: row.period_xp ?? row.total_xp ?? 0,
      total_xp: row.total_xp,
      overall_rank: row.overall_rank,
    }));

    setAllLeaderboard(sorted);
    setLeaderboard(sorted.slice(0, 10));
    setLeaderboardVisible(10);

    const userEmail = session?.user?.email?.trim().toLowerCase();
    if (userEmail) {
      const idx = sorted.findIndex((entry) => entry.email === userEmail);
      setUserRank(idx >= 0 ? idx + 1 : null);
    } else {
      setUserRank(null);
    }

    setLoadingLeaderboard(false);
  }, [session]);

  useEffect(() => { fetchLeaderboard(leaderboardFilter); }, [leaderboardFilter, fetchLeaderboard]);

  // Live updates whenever backend leaderboard table changes
  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel("leaderboard-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard_scores" },
        () => {
          fetchLeaderboard(leaderboardFilter);
          calculatePoints();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, leaderboardFilter, fetchLeaderboard, calculatePoints]);

  // Fetch user activities
  const fetchActivities = useCallback(async () => {
    const userEmail = session?.user?.email?.trim().toLowerCase();
    if (!userEmail) return;
    setLoadingActivities(true);
    const { data, count } = await supabase
      .from("user_activities")
      .select("*", { count: "exact" })
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false })
      .range(0, 19); // fetch up to 20
    setActivities(data || []);
    setAllActivitiesCount(count || 0);
    setActivitiesVisible(5);
    setLoadingActivities(false);
  }, [session]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

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
        supabase.functions.invoke("fetch-post-text", {
          body: { contribution_id: contributionId, post_url: postUrl.trim() },
        }).catch(console.error);
        supabase.functions.invoke("notify-admin-contribution", {
          body: { post_url: postUrl.trim(), user_email: session.user.email, contribution_id: contributionId },
        }).catch(console.error);
        const ctLabel = contentTypes.find(t => t.value === contentType)?.label || contentType;
        const masked = session.user.email?.replace(/(.{3}).*(@.*)/, "$1***$2");
        const profileUrl = profile?.referral_code ? `${window.location.origin}/u/${profile.referral_code}` : null;
        const userLine = profileUrl ? `<a href="${profileUrl}">${masked}</a>` : masked;
        supabase.functions.invoke("notify-telegram", {
          body: {
            kind: "feed",
            text: `📝 <b>New ${ctLabel}</b>\n\n<b>By:</b> ${userLine}\n<b>Status:</b> Awaiting score (within ${scoringDelay}h)\n\n🔗 ${postUrl.trim()}`,
            link: postUrl.trim(),
            buttonText: "View post",
          },
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

    if (task.task_type === "form") {
      setShowValidationForm(true);
      return;
    }

    // Link submission required
    if (task.requires_link_submission) {
      const link = (taskLinks[task.id] || "").trim();
      if (!link) {
        toast({ title: "Link required", description: task.submission_label || "Please paste a link.", variant: "destructive" });
        return;
      }
      const { error } = await supabase
        .from("contribute_task_completions" as any)
        .insert({ user_id: session.user.id, task_id: task.id, submission_link: link } as any);
      if (!error) {
        setCompletedTaskIds(prev => new Set([...prev, task.id]));
        toast({ title: `+${task.points} XP`, description: task.label });
        calculatePoints();
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
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
      toast({ title: `+${task.points} XP`, description: task.label });
      calculatePoints();
    }
  };

  // Handle validation form complete
  const handleValidationComplete = async () => {
    setValidationCompleted(true);
    setShowValidationForm(false);
    // Mark the form task as completed
    const formTask = contributeTasks.find(t => t.task_type === "form");
    if (formTask && session?.user) {
      await supabase
        .from("contribute_task_completions" as any)
        .insert({ user_id: session.user.id, task_id: formTask.id } as any);
      setCompletedTaskIds(prev => new Set([...prev, formTask.id]));
    }
    calculatePoints();
    fetchLeaderboard(leaderboardFilter);
  };

  const loadMoreLeaderboard = () => {
    const next = leaderboardVisible + 10;
    setLeaderboard(allLeaderboard.slice(0, next));
    setLeaderboardVisible(next);
  };

  // Check if validation form task should show as done
  const isTaskDone = (task: ContributeTask) => {
    if (task.task_type === "form") return validationCompleted || completedTaskIds.has(task.id);
    return completedTaskIds.has(task.id);
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
              Share your RaidFi posts, complete tasks, and earn XP.
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
                        className="text-xs text-muted-foreground w-full text-center">
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
              {/* Validation form overlay */}
              {showValidationForm && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-foreground">Complete Validation Form</h3>
                      <button onClick={() => setShowValidationForm(false)} className="text-xs text-muted-foreground">
                        Cancel
                      </button>
                    </div>
                    <ValidationForm
                      userId={session.user.id}
                      userEmail={session.user.email || ""}
                      onComplete={handleValidationComplete}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Name prompt */}
              {profile && !profile.name && !showValidationForm && (
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

              {!showValidationForm && (
                <>
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
                        <button onClick={handleSignOut} className="text-xs text-muted-foreground flex items-center gap-1">
                          <LogOut className="w-3 h-3" /> Sign out
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-primary/10 text-center">
                          <p className="text-lg font-bold text-foreground">{userTotalPoints}</p>
                          <p className="text-[10px] text-muted-foreground">XP</p>
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
                      <form onSubmit={handleSubmitPost} className="flex gap-2 flex-wrap">
                        <select value={contentType} onChange={(e) => setContentType(e.target.value)}
                          className="h-9 text-sm rounded-md border border-input bg-background px-2 text-foreground">
                          {contentTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <Input type="url" placeholder="https://x.com/user/status/..." value={postUrl}
                          onChange={(e) => setPostUrl(e.target.value)} required className="h-9 text-sm flex-1 min-w-[180px]" />
                        <Button type="submit" size="sm" className="h-9 px-4" disabled={submittingPost}>
                          {submittingPost ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        </Button>
                      </form>
                      <p className="text-[11px] text-muted-foreground mt-2">Posts are scored within {scoringDelay}h.</p>
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
                          const done = isTaskDone(task);
                          return (
                            <Card key={task.id} className={`${done ? "opacity-60" : ""} ${task.is_pinned ? "border-primary/40" : ""}`}>
                              <CardContent className="p-4 space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {task.is_pinned && <span className="text-[10px] text-primary font-semibold uppercase">★ Pinned</span>}
                                      <p className="text-sm font-medium text-foreground">{task.label}</p>
                                    </div>
                                    {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                                    {task.action_types && task.action_types.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1.5">
                                        {task.action_types.map(at => (
                                          <span key={at} className="px-1.5 py-0.5 rounded text-[10px] uppercase bg-muted text-muted-foreground">{at}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-xs font-semibold text-primary">+{task.points} XP</span>
                                    {!task.requires_link_submission && (
                                      <Button size="sm" variant={done ? "ghost" : "outline"} disabled={done}
                                        onClick={() => handleCompleteTask(task)} className="h-8 text-xs">
                                        {done ? <><Check className="w-3 h-3 mr-1" /> Done</> : task.url ? "Open" : "Complete"}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                {task.requires_link_submission && !done && (
                                  <div className="flex gap-2">
                                    <Input value={taskLinks[task.id] || ""}
                                      onChange={(e) => setTaskLinks(prev => ({ ...prev, [task.id]: e.target.value }))}
                                      placeholder={task.submission_placeholder || "Paste your link..."} className="h-8 text-xs flex-1" />
                                    <Button size="sm" onClick={() => handleCompleteTask(task)} className="h-8 text-xs">Submit</Button>
                                  </div>
                                )}
                                {task.requires_link_submission && done && (
                                  <p className="text-[11px] text-primary flex items-center gap-1"><Check className="w-3 h-3" /> Submitted</p>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Activity Log */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <History className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Your Activity</h3>
                    </div>
                    {loadingActivities ? (
                      <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
                    ) : activities.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-3">No activity yet.</p>
                    ) : (
                      <Card>
                        <CardContent className="p-0">
                          <div className="divide-y divide-border">
                            {activities.slice(0, activitiesVisible).map((a) => (
                              <div key={a.id} className="flex items-center justify-between px-4 py-2.5">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${
                                    a.activity_type === "admin_grant" ? "bg-primary/20 text-primary" :
                                    a.activity_type === "contribution" ? "bg-green-500/20 text-green-400" :
                                    a.activity_type === "validation" ? "bg-purple-500/20 text-purple-400" :
                                    a.activity_type === "waitlist" ? "bg-blue-500/20 text-blue-400" :
                                    "bg-muted text-muted-foreground"
                                  }`}>{a.activity_type === "admin_grant" ? "Bonus" : a.activity_type}</span>
                                  <span className="text-xs text-muted-foreground truncate">{a.description}</span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className={`text-xs font-semibold ${a.points >= 0 ? "text-green-400" : "text-destructive"}`}>
                                    {a.points > 0 ? "+" : ""}{a.points} XP
                                  </span>
                                  <span className="text-[10px] text-muted-foreground hidden sm:block">
                                    {new Date(a.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {activitiesVisible < activities.length && (
                      <div className="text-center pt-2">
                        <Button variant="ghost" size="sm" onClick={() => setActivitiesVisible(v => v + 10)} className="text-xs">
                          See more
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Leaderboard */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-foreground">Leaderboard</h3>
                      <div className="flex gap-1">
                        {(["all", "day", "week", "month"] as const).map(f => (
                          <button key={f} onClick={() => setLeaderboardFilter(f)}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              leaderboardFilter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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
                                const showTotal = leaderboardFilter !== "all" && entry.total_xp != null;
                                return (
                                  <div key={entry.email} className={`flex items-center justify-between px-4 py-3 ${isUser ? "bg-primary/5" : ""}`}>
                                    <div className="flex items-center gap-3 min-w-0">
                                      <span className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                                        i === 0 ? "bg-yellow-500/20 text-yellow-500" :
                                        i === 1 ? "bg-gray-400/20 text-gray-400" :
                                        i === 2 ? "bg-orange-500/20 text-orange-500" :
                                        "bg-muted text-muted-foreground"
                                      }`}>{i + 1}</span>
                                      <div className="min-w-0">
                                        <p className={`text-sm truncate ${isUser ? "text-primary font-medium" : "text-foreground"}`}>
                                          {entry.display_name} {isUser && "(You)"}
                                        </p>
                                        {showTotal && (
                                          <p className="text-[10px] text-muted-foreground">
                                            Total: {entry.total_xp} XP · Overall #{entry.overall_rank}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-sm font-semibold text-primary shrink-0">{entry.total_points} XP</span>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>

                        {userRank && userRank > leaderboardVisible && (
                          <div className="mt-2 px-4 py-2 rounded-lg bg-primary/5 border border-primary/20 text-sm text-foreground flex justify-between">
                            <span>Your position: <strong>#{userRank}</strong></span>
                            <span className="font-semibold text-primary">{userTotalPoints} XP</span>
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
                    <a href="/feed" className="text-sm text-primary flex items-center gap-1 justify-center">
                      <ExternalLink className="w-3.5 h-3.5" /> View Live Feed
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contributions;
