import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/auth/PasswordInput";
import { Loader2, Mail, LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { validateEmail, validatePassword, passwordStrength } from "@/lib/password";

type Mode = "signin" | "signup";

const Login = () => {
  useSEO({
    title: "Login - RaidFi",
    description: "Sign in to RaidFi to access your contributor dashboard and reputation.",
    path: "/login",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [betaCode, setBetaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentVerification, setSentVerification] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data: isProjectAdmin } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "project_admin" as any,
      });
      navigate(isProjectAdmin ? "/project" : "/dashboard");
    });
  }, [navigate]);

  const routeAfterLogin = async (userId: string) => {
    const { data: isProjectAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "project_admin" as any,
    });
    navigate(isProjectAdmin ? "/project" : "/dashboard");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) {
      toast({ title: "Check your email", description: emailErr, variant: "destructive" });
      return;
    }
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error) {
      setLoading(false);
      toast({
        title: "Could not sign in",
        description:
          error.message.toLowerCase().includes("not confirmed")
            ? "Verify your email first - check your inbox for the verification link."
            : "Email or password is incorrect.",
        variant: "destructive",
      });
      return;
    }

    if (data.session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", data.session.user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.from("profiles").insert({
          user_id: data.session.user.id,
          email: cleanEmail,
          waitlist_completed: true,
        });
      } else if (!(profile as any).referral_code) {
        const { data: codeData } = await supabase.rpc("generate_referral_code");
        if (codeData) {
          await supabase
            .from("profiles")
            .update({ referral_code: codeData } as any)
            .eq("user_id", data.session.user.id);
        }
      }
      await routeAfterLogin(data.session.user.id);
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) {
      toast({ title: "Check your email", description: emailErr, variant: "destructive" });
      return;
    }
    const pwErr = validatePassword(password);
    if (pwErr) {
      toast({ title: "Weak password", description: pwErr, variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", description: "Both fields must be identical.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const code = betaCode.trim().toUpperCase();

    let allowed = false;
    if (code) {
      const { data: check } = await supabase.rpc("check_beta_code" as any, { _code: code, _email: cleanEmail });
      const result: any = Array.isArray(check) ? check[0] : check;
      if (!result?.valid) {
        toast({
          title: "Invalid beta code",
          description: "That code is unknown, already used, or expired.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      allowed = true;
    }

    if (!allowed) {
      const { data: emailExists } = await supabase.rpc("check_email_exists", { check_email: cleanEmail });
      if (!emailExists) {
        toast({
          title: "No access yet",
          description: "Request beta access or enter a beta access code to create an account.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { emailRedirectTo: `${window.location.origin}/email-verified` },
    });

    if (error) {
      setLoading(false);
      toast({
        title: "Could not create account",
        description: error.message.toLowerCase().includes("already registered")
          ? "An account already exists for this email. Sign in instead."
          : error.message,
        variant: "destructive",
      });
      return;
    }

    if (code) {
      await supabase.rpc("consume_beta_code" as any, { _code: code, _email: cleanEmail });
    }

    setSentVerification(true);
    setLoading(false);
  };

  const strength = passwordStrength(password);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-12 pt-24">
        <div className="max-w-sm w-full">
          <AnimatePresence mode="wait">
            {sentVerification ? (
              <motion.div
                key="verify"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Verify your email</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  We sent a verification link to{" "}
                  <span className="text-foreground font-medium">{email.trim().toLowerCase()}</span>. Click
                  it, then come back and sign in with your password.
                </p>
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => {
                    setSentVerification(false);
                    setMode("signin");
                    setPassword("");
                    setConfirm("");
                  }}
                >
                  Back to sign in
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  {mode === "signin" ? (
                    <LogIn className="w-8 h-8 text-primary" />
                  ) : (
                    <UserPlus className="w-8 h-8 text-primary" />
                  )}
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {mode === "signin" ? "Welcome back" : "Create your account"}
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                  {mode === "signin"
                    ? "Sign in with your email and password."
                    : "Set a password. We'll email you a verification link."}
                </p>

                <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
                  <div className="glass-card p-6 rounded-xl text-left">
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/[0.05] border-white/[0.1] text-foreground h-12 text-base"
                      maxLength={255}
                      autoComplete="email"
                      required
                    />
                    <PasswordInput
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/[0.05] border-white/[0.1] text-foreground h-12 text-base mt-3"
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      required
                    />
                    {mode === "signup" && (
                      <>
                        {password && (
                          <p className="text-[11px] text-muted-foreground mt-2">
                            Strength: <span className="text-foreground">{strength.label}</span> - 8+
                            characters, upper and lower case, and a number.
                          </p>
                        )}
                        <PasswordInput
                          placeholder="Confirm password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          className="bg-white/[0.05] border-white/[0.1] text-foreground h-12 text-base mt-3"
                          autoComplete="new-password"
                          required
                        />
                        <Input
                          type="text"
                          placeholder="Beta access code (optional)"
                          value={betaCode}
                          onChange={(e) => setBetaCode(e.target.value)}
                          className="bg-white/[0.05] border-white/[0.1] text-foreground h-11 text-sm mt-3 tracking-widest uppercase font-mono"
                        />
                      </>
                    )}

                    <Button type="submit" className="w-full mt-4 h-12 text-base font-semibold" disabled={loading}>
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {mode === "signin" ? "Sign in" : "Create account"}
                    </Button>

                    {mode === "signin" && (
                      <a
                        href="/forgot-password"
                        className="block text-center text-xs text-muted-foreground hover:text-foreground mt-3"
                      >
                        Forgot your password?
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {mode === "signin" ? (
                      <>
                        Have a beta code?{" "}
                        <button
                          type="button"
                          onClick={() => setMode("signup")}
                          className="text-primary hover:underline"
                        >
                          Create an account
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setMode("signin")}
                          className="text-primary hover:underline"
                        >
                          Sign in
                        </button>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    No access yet?{" "}
                    <a href="/beta" className="text-primary hover:underline">
                      Request beta access
                    </a>
                  </p>
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
