import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, ArrowRight, ExternalLink, Send, Twitter, MessageCircle, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";

const SIGNUP_STORAGE_KEY = "raidfi_waitlist_signup";
const SIGNUP_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;
const MIN_VERIFY_DELAY_MS = 10000; // 10 seconds anti-abuse

const generateReferralCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 8; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const getSignupCooldown = (): { blocked: boolean; email?: string } => {
  try {
    const raw = localStorage.getItem(SIGNUP_STORAGE_KEY);
    if (!raw) return { blocked: false };
    const data = JSON.parse(raw);
    if (Date.now() - data.timestamp < SIGNUP_COOLDOWN_MS) return { blocked: true, email: data.email };
    localStorage.removeItem(SIGNUP_STORAGE_KEY);
    return { blocked: false };
  } catch { return { blocked: false }; }
};

const recordSignup = (email: string) => {
  localStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify({ email, timestamp: Date.now() }));
};

interface WaitlistTask {
  id: string;
  task_type: string;
  label: string;
  url: string;
  sort_order: number;
  requires_input: boolean;
  input_label: string | null;
  input_placeholder: string | null;
  verification_type: string;
}

interface TaskState {
  clickedAt: number | null;
  verified: boolean;
  inputValue: string;
}

type Step = "welcome" | "tasks" | "email" | "congrats" | "share";

const taskIcons: Record<string, React.ReactNode> = {
  telegram: <Send className="w-5 h-5" />,
  x_follow: <Twitter className="w-5 h-5" />,
  x_comment: <MessageCircle className="w-5 h-5" />,
};

const Waitlist = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref");

  const [step, setStep] = useState<Step>("welcome");
  const [tasks, setTasks] = useState<WaitlistTask[]>([]);
  const [taskStates, setTaskStates] = useState<Record<string, TaskState>>({});
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [verifyingTask, setVerifyingTask] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Tick for countdown display
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await supabase
        .from("waitlist_tasks")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data) {
        setTasks(data as any);
        const states: Record<string, TaskState> = {};
        (data as any[]).forEach(t => { states[t.id] = { clickedAt: null, verified: false, inputValue: "" }; });
        setTaskStates(states);
      }
    };
    fetchTasks();
  }, []);

  const handleTaskClick = (task: WaitlistTask) => {
    window.open(task.url, "_blank", "noopener,noreferrer");
    setTaskStates(prev => {
      if (prev[task.id]?.clickedAt) return prev; // already clicked
      return { ...prev, [task.id]: { ...prev[task.id], clickedAt: Date.now() } };
    });
  };

  const handleVerify = async (task: WaitlistTask) => {
    const state = taskStates[task.id];
    if (!state?.clickedAt) return;

    // Anti-abuse check
    if (Date.now() - state.clickedAt < MIN_VERIFY_DELAY_MS) {
      toast({ title: "Too fast", description: "Please wait before verifying.", variant: "destructive" });
      return;
    }

    // Input validation
    if (task.requires_input && !state.inputValue.trim()) {
      toast({ title: "Required", description: task.input_label || "Please provide the required input.", variant: "destructive" });
      return;
    }

    setVerifyingTask(task.id);

    // Store submission
    const { error } = await supabase.from("waitlist_task_submissions" as any).insert({
      submission_email: email || "pre-signup",
      task_id: task.id,
      clicked_at: new Date(state.clickedAt).toISOString(),
      verified_at: new Date().toISOString(),
      input_value: state.inputValue.trim() || null,
    } as any);

    if (error) console.error("Task submission error:", error);

    setTaskStates(prev => ({
      ...prev,
      [task.id]: { ...prev[task.id], verified: true },
    }));
    setVerifyingTask(null);
  };

  const updateTaskInput = (taskId: string, value: string) => {
    setTaskStates(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], inputValue: value },
    }));
  };

  const allTasksDone = tasks.length > 0 && tasks.every(t => taskStates[t.id]?.verified);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const cooldown = getSignupCooldown();
    if (cooldown.blocked) {
      toast({ title: "Already signed up", description: `You already submitted with ${cooldown.email}.`, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: emailExists } = await supabase.rpc("check_email_exists", { check_email: email.trim().toLowerCase() });
      if (emailExists) {
        toast({ title: "Already on the list", description: "This email is already registered.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const newId = crypto.randomUUID();
      const code = generateReferralCode();

      const { error } = await supabase.from("waitlist_submissions").insert({
        id: newId,
        email: email.trim().toLowerCase(),
        points: 50,
        referral_code: code,
        referred_by: refCode || null,
      } as any);
      if (error) throw error;

      // Update task submissions with email
      await supabase.from("waitlist_task_submissions" as any)
        .update({ submission_email: email.trim().toLowerCase() } as any)
        .eq("submission_email", "pre-signup");

      // Process referral
      if (refCode) {
        try { await supabase.rpc("process_referral", { referrer_code: refCode }); } catch (e) { console.error(e); }
      }

      recordSignup(email);
      setSubmissionId(newId);
      setReferralCode(code);
      setStep("congrats");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleXShare = async () => {
    const siteUrl = window.location.origin;
    const referralLink = `${siteUrl}/waitlist?ref=${referralCode}`;
    const tweetText = `I just joined the @RaidFi_App waitlist. Don't miss this → ${referralLink}`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, "_blank", "noopener,noreferrer");

    try {
      await supabase.from("waitlist_submissions").update({ x_shared: true } as any).eq("id", submissionId);
    } catch (err) { console.error(err); }

    setStep("share");
  };

  const slideVariants = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-12 pt-24">
        <div className="max-w-md w-full">
          <AnimatePresence mode="wait">
            {step === "welcome" && (
              <motion.div key="welcome" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <ArrowRight className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-3">Join the <span className="text-gradient">Waitlist</span></h1>
                <p className="text-muted-foreground mb-8">Complete a few quick steps to secure your spot and earn early access.</p>
                <Button size="lg" onClick={() => setStep("tasks")} className="h-12 px-8 text-base">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === "tasks" && (
              <motion.div key="tasks" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Complete Tasks</h2>
                  <p className="text-sm text-muted-foreground">Join our community channels to continue.</p>
                </div>

                <div className="space-y-3">
                  {tasks.map((task) => {
                    const state = taskStates[task.id] || { clickedAt: null, verified: false, inputValue: "" };
                    const hasClicked = !!state.clickedAt;
                    const canVerify = hasClicked && (now - (state.clickedAt || 0)) >= MIN_VERIFY_DELAY_MS;
                    const secondsLeft = hasClicked ? Math.max(0, Math.ceil((MIN_VERIFY_DELAY_MS - (now - (state.clickedAt || 0))) / 1000)) : 0;

                    return (
                      <div key={task.id} className={`rounded-xl border transition-all ${
                        state.verified ? "border-primary/30 bg-primary/5" : "border-border bg-card"
                      }`}>
                        {/* Main task button */}
                        <button
                          onClick={() => handleTaskClick(task)}
                          disabled={state.verified}
                          className="w-full flex items-center gap-4 p-4 text-left"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            state.verified ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                          }`}>
                            {state.verified ? <CheckCircle2 className="w-5 h-5" /> : taskIcons[task.task_type] || <ExternalLink className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm font-medium ${state.verified ? "text-primary" : "text-foreground"}`}>{task.label}</span>
                            {state.verified && <span className="block text-xs text-primary mt-0.5">Verified ✓</span>}
                            {hasClicked && !state.verified && !canVerify && (
                              <span className="block text-xs text-muted-foreground mt-0.5">Wait {secondsLeft}s to verify</span>
                            )}
                          </div>
                          {!hasClicked && <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />}
                        </button>

                        {/* Verify section */}
                        {hasClicked && !state.verified && (
                          <div className="px-4 pb-4 space-y-2">
                            {task.requires_input && (
                              <Input
                                placeholder={task.input_placeholder || "Enter value..."}
                                value={state.inputValue}
                                onChange={(e) => updateTaskInput(task.id, e.target.value)}
                                className="h-9 text-sm"
                              />
                            )}
                            <Button
                              size="sm"
                              disabled={!canVerify || verifyingTask === task.id}
                              onClick={() => handleVerify(task)}
                              className="w-full h-8 text-xs"
                            >
                              {verifyingTask === task.id ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ) : (
                                <ShieldCheck className="w-3 h-3 mr-1" />
                              )}
                              {canVerify ? "Verify" : `Verify (${secondsLeft}s)`}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <Button size="lg" className="w-full h-12 text-base" disabled={!allTasksDone} onClick={() => setStep("email")}>
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  {!allTasksDone && <p className="text-xs text-muted-foreground text-center mt-2">Complete and verify all tasks to continue</p>}
                </div>
              </motion.div>
            )}

            {step === "email" && (
              <motion.div key="email" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="text-center">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Almost There</h2>
                  <p className="text-sm text-muted-foreground">Enter your email to secure your spot.</p>
                </div>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="glass-card p-6 rounded-xl">
                    <Input type="email" placeholder="you@example.com" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/[0.05] border-white/[0.1] text-foreground h-12 text-base" required />
                    <Button type="submit" className="w-full mt-4 h-12 text-base font-semibold" disabled={loading}>
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Submit
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">No spam. Early access only.</p>
                </form>
              </motion.div>
            )}

            {step === "congrats" && (
              <motion.div key="congrats" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Congrats, you joined the waitlist!</h2>
                <p className="text-primary font-semibold text-lg mb-1">+50 RaidFi Points</p>
                <p className="text-sm text-muted-foreground mb-8">One last step — share on X to verify and unlock contributions.</p>
                <Button size="lg" onClick={handleXShare} className="h-12 px-8 text-base">
                  <Twitter className="w-5 h-5 mr-2" /> Share on X to Verify
                </Button>
              </motion.div>
            )}

            {step === "share" && (
              <motion.div key="share" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">You're Verified!</h2>
                <p className="text-sm text-muted-foreground mb-8">Head to the Contributions page to sign in and start earning points.</p>
                <Button size="lg" asChild className="h-12 px-8 text-base">
                  <a href="/contributions">Go to Contributions</a>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Waitlist;
