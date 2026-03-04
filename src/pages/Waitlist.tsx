import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ValidationForm from "@/components/validation/ValidationForm";

const SIGNUP_STORAGE_KEY = "raidfi_waitlist_signup";
const SIGNUP_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

const getSignupCooldown = (): { blocked: boolean; email?: string } => {
  try {
    const raw = localStorage.getItem(SIGNUP_STORAGE_KEY);
    if (!raw) return { blocked: false };
    const data = JSON.parse(raw);
    const elapsed = Date.now() - data.timestamp;
    if (elapsed < SIGNUP_COOLDOWN_MS) {
      return { blocked: true, email: data.email };
    }
    localStorage.removeItem(SIGNUP_STORAGE_KEY);
    return { blocked: false };
  } catch {
    return { blocked: false };
  }
};

const recordSignup = (email: string) => {
  localStorage.setItem(
    SIGNUP_STORAGE_KEY,
    JSON.stringify({ email, timestamp: Date.now() })
  );
};

type WaitlistState = "form" | "validation" | "completed";

const Waitlist = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<WaitlistState>("form");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [waitlistUserId, setWaitlistUserId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const cooldown = getSignupCooldown();
    if (cooldown.blocked) {
      toast({
        title: "Already signed up",
        description: `You've already submitted with ${cooldown.email}. Try again in a few days.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: emailExists, error: checkError } = await supabase.rpc(
        "check_email_exists",
        { check_email: email.trim().toLowerCase() }
      );

      if (checkError) throw checkError;

      if (emailExists) {
        toast({
          title: "Already on the list",
          description: "This email is already registered.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const newId = crypto.randomUUID();
      const { error } = await supabase
        .from("waitlist_submissions")
        .insert({ id: newId, email, points: 50 });

      if (error) throw error;

      recordSignup(email);
      setSubmittedEmail(email);
      setWaitlistUserId(newId);
      setState("validation");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-12 pt-24">
        <div className="max-w-md w-full">
          {state === "form" && (
            <div className="text-center">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-3">
                  Join the <span className="text-primary">Waitlist</span>
                </h1>
                <p className="text-muted-foreground">
                  Be among the first to experience RaidFi. Enter your email to secure your spot.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="glass-card p-6 rounded-xl">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/[0.05] border-white/[0.1] text-foreground h-12 text-base"
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full mt-4 h-12 text-base font-semibold"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Join Waitlist
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  No spam. Early Access.
                </p>
              </form>
            </div>
          )}

          {state === "validation" && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">You're on the list!</h2>
                <p className="text-muted-foreground text-sm mb-1">
                  Signed up as <span className="text-foreground font-medium">{submittedEmail}</span>
                </p>
                <p className="text-primary font-semibold mb-4">+50 RaidFi Points earned</p>
                <p className="text-sm text-muted-foreground">Answer a few quick questions to earn <span className="text-primary font-semibold">200 bonus points</span> and boost your priority.</p>
              </div>
              <ValidationForm
                userId={waitlistUserId}
                userEmail={submittedEmail}
                onComplete={() => setState("completed")}
              />
            </div>
          )}

          {state === "completed" && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">You're all set!</h2>
              <p className="text-primary font-semibold text-lg mb-1">250 RaidFi Points</p>
              <p className="text-muted-foreground mb-8">We'll reach out with early access details. The more points you have, the sooner you get in.</p>
              <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Waitlist;
