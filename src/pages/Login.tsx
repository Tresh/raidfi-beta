import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    // Check if email is in waitlist with x_shared = true
    const { data: emailExists } = await supabase.rpc("check_email_exists", {
      check_email: email.trim().toLowerCase(),
    });

    if (!emailExists) {
      toast({
        title: "Not on the waitlist",
        description: "Complete the waitlist first to get access.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setOtpSent(true);
      toast({ title: "Check your email", description: "We've sent you a 6-digit code." });
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp,
      type: "email",
    });

    if (error) {
      toast({ title: "Invalid code", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    if (data.session) {
      // Check if profile exists, if not create one
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", data.session.user.id)
        .maybeSingle();

      if (!profile) {
        // Check waitlist for this email
        const emailLower = email.trim().toLowerCase();

        // Get referral code from waitlist submission
        // We can't read waitlist_submissions directly (no anon select), 
        // but we're now authenticated, and there's no auth select policy either.
        // So we create a profile with a new referral code.
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            user_id: data.session.user.id,
            email: emailLower,
            waitlist_completed: true,
            x_shared: true,
          });

        if (insertError) {
          console.error("Profile creation error:", insertError);
        }

        // Process referral if applicable - we need a way to get referred_by
        // Since we stored it in waitlist_submissions, we'll handle this via a DB function in the future
      }

      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-12 pt-24">
        <div className="max-w-sm w-full">
          <AnimatePresence mode="wait">
            {!otpSent ? (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter your email to sign in with a one-time code.
                </p>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="glass-card p-6 rounded-xl">
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/[0.05] border-white/[0.1] text-foreground h-12 text-base"
                      required
                    />
                    <Button type="submit" className="w-full mt-4 h-12 text-base font-semibold" disabled={loading}>
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Send Code
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Don't have access? <a href="/waitlist" className="text-primary hover:underline">Join the waitlist</a>
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <KeyRound className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Enter Code</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  We sent a code to <span className="text-foreground font-medium">{email}</span>
                </p>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="glass-card p-6 rounded-xl">
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="bg-white/[0.05] border-white/[0.1] text-foreground h-12 text-base text-center tracking-[0.3em] font-mono"
                      maxLength={6}
                      required
                    />
                    <Button type="submit" className="w-full mt-4 h-12 text-base font-semibold" disabled={loading}>
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Verify & Login
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(""); }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Use different email
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
