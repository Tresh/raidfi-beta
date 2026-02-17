import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Sparkles, Gift, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

type Step = "email" | "otp" | "done";

const Waitlist = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [showPointsDialog, setShowPointsDialog] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setStep("otp");
      toast({
        title: "Code sent!",
        description: "Check your email for a 6-digit verification code.",
      });
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

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpValue,
        type: "email",
      });
      if (error) throw error;

      // Save to waitlist_submissions
      if (data.user) {
        await supabase.from("waitlist_submissions").upsert(
          { user_id: data.user.id, email, points: 50 },
          { onConflict: "email" }
        );
      }

      setShowPointsDialog(true);
    } catch (err: any) {
      toast({
        title: "Verification failed",
        description: err.message || "Invalid code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToValidation = () => {
    setShowPointsDialog(false);
    navigate("/validation", { state: { email } });
  };

  const handleSkip = () => {
    setShowPointsDialog(false);
    setStep("done");
    toast({
      title: "You're on the list!",
      description: "We'll be in touch soon.",
    });
  };

  if (step === "done") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 glow-cyan">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            You're on the waitlist!
          </h2>
          <p className="text-muted-foreground mb-8">
            Thanks for joining. We'll reach out when we're ready to launch.
          </p>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 glass">
        <div className="container mx-auto px-6 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <img src={logo} alt="Swipht" className="w-8 h-8 rounded-full" />
            <span className="font-medium text-foreground">Swipht</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 glow-cyan">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              {step === "email" ? (
                <>Join the <span className="text-primary">Waitlist</span></>
              ) : (
                <>Verify Your <span className="text-primary">Email</span></>
              )}
            </h1>
            <p className="text-muted-foreground">
              {step === "email"
                ? "Be among the first to experience RaidFi. Enter your email to secure your spot."
                : `We sent a 6-digit code to ${email}. Enter it below to confirm.`}
            </p>
          </div>

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                No spam. Unsubscribe anytime.
              </p>
            </form>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <div className="glass-card p-6 rounded-xl flex flex-col items-center gap-4">
                <InputOTP
                  maxLength={6}
                  value={otpValue}
                  onChange={setOtpValue}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <Button
                  onClick={handleVerifyOtp}
                  className="w-full h-12 text-base font-semibold"
                  disabled={loading || otpValue.length !== 6}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Verify & Join
                </Button>
              </div>
              <button
                onClick={() => { setStep("email"); setOtpValue(""); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Points Dialog */}
      <Dialog open={showPointsDialog} onOpenChange={setShowPointsDialog}>
        <DialogContent className="glass-card border-primary/20 sm:max-w-md">
          <DialogHeader className="text-center items-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2 glow-cyan">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-xl text-foreground">
              🎉 You earned <span className="text-primary">50 RaidFi Points</span>!
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">
              Complete a quick validation form to earn{" "}
              <span className="text-primary font-semibold">200 bonus points</span> and
              get early access priority.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button onClick={handleContinueToValidation} className="h-12 font-semibold">
              <Gift className="w-4 h-4 mr-2" />
              Earn 200 More Points
            </Button>
            <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Waitlist;
