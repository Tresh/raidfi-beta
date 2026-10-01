import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/auth/PasswordInput";
import { Loader2, Mail, LogIn, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import PasswordStrength from "@/components/ui/password-strength";
import { cn } from "@/lib/utils";
import {
  PASSWORD_MAX_LENGTH,
  passwordRequirements,
  validateEmail,
  validatePassword,
} from "@/lib/password";

type Mode = "signin" | "signup";

const Login = () => {
  useSEO({
    title: "Login - RaidFi",
    description: "Sign in to RaidFi to access your contributor dashboard and reputation.",
    path: "/login",
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [betaCode, setBetaCode] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentVerification, setSentVerification] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    const codeParam = searchParams.get("code");
    const modeParam = searchParams.get("mode");
    const refParam = searchParams.get("ref") || searchParams.get("referred_by") || sessionStorage.getItem("raidfi_ref_code");
    if (refParam) {
      setReferredBy(refParam.trim());
      sessionStorage.setItem("raidfi_ref_code", refParam.trim());
    }
    const isSignupPath = window.location.pathname === "/signup" || window.location.pathname === "/beta-access";
    if (codeParam) {
      setBetaCode(codeParam.trim().toUpperCase());
      setMode("signup");
    } else if (modeParam === "signup" || isSignupPath) {
      setMode("signup");
    }
  }, [searchParams]);

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode);
    setPassword("");
    setConfirm("");
  };

  const [needCode, setNeedCode] = useState(false);
  const refCodeValue = () =>
    referredBy.trim() || searchParams.get("ref") || searchParams.get("referred_by") || sessionStorage.getItem("raidfi_ref_code") || null;

  const routeAfterLogin = async (userId: string) => {
    const { data: isProjectAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "project_admin" as any });
    navigate(isProjectAdmin ? "/project" : "/dashboard");
  };

  const validateCode = async (code: string, cleanEmail: string) => {
    const { data: check } = await supabase.rpc("check_beta_code" as any, { _code: code, _email: cleanEmail });
    const result: any = Array.isArray(check) ? check[0] : check;
    if (result?.valid) return null;
    const reasons: Record<string, string> = {
      unknown: "We couldn't find that code. Check for typos.",
      exhausted: "That code has already been used.",
      email_mismatch: "That code belongs to a different email.",
      own_code: "You can't use your own invite code.",
      not_approved: "That request hasn't been approved yet.",
    };
    return reasons[result?.reason] ?? "That code can't be used.";
  };

  // Ensures a signed-in user has a profile. Google newcomers must pass the beta gate.
  const finishAccess = async (session: any, codeOverride?: string) => {
    const user = session.user;
    const cleanEmail = (user.email || "").toLowerCase();
    const refCode = refCodeValue();
    const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
    if (profile) {
      const updates: any = {};
      if (!(profile as any).referral_code) {
        const { data: codeData } = await supabase.rpc("generate_referral_code");
        if (codeData) updates.referral_code = codeData;
      }
      if (Object.keys(updates).length) await supabase.from("profiles").update(updates).eq("user_id", user.id);
      return routeAfterLogin(user.id);
    }
    const isGoogle = user.app_metadata?.provider === "google";
    const code = (codeOverride ?? sessionStorage.getItem("raidfi_pending_code") ?? "").trim().toUpperCase();
    if (isGoogle) {
      let allowed = false;
      if (code) {
        const err = await validateCode(code, cleanEmail);
        if (err) {
          if (codeOverride) { toast({ title: "Invalid beta code", description: err, variant: "destructive" }); return; }
        } else allowed = true;
      }
      if (!allowed) {
        const { data: emailExists } = await supabase.rpc("check_email_exists", { check_email: cleanEmail });
        allowed = !!emailExists;
      }
      if (!allowed) { setEmail(cleanEmail); setNeedCode(true); return; }
      await supabase.rpc("consume_beta_code" as any, { _code: code || null, _email: cleanEmail, _referred_by: refCode });
    }
    sessionStorage.removeItem("raidfi_pending_code");
    await supabase.from("profiles").insert({
      user_id: user.id, email: cleanEmail, waitlist_completed: true, referred_by: refCode, beta_code: code || "AUTO_ACCEPTED",
    } as any);
    await routeAfterLogin(user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { if (session) finishAccess(session); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) setTimeout(() => finishAccess(session), 0);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogle = async () => {
    if (betaCode.trim()) sessionStorage.setItem("raidfi_pending_code", betaCode.trim().toUpperCase());
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/login` });
    if (result.error) {
      setLoading(false);
      toast({ title: "Google sign-in failed", description: String((result.error as any).message ?? result.error), variant: "destructive" });
    }
  };

  const submitCodeForGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!betaCode.trim()) return;
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) await finishAccess(session, betaCode);
    setLoading(false);
  };

  // One form: try sign in first; if no account exists, create one (needs a beta code or approved email).
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) { toast({ title: "Check your email", description: emailErr, variant: "destructive" }); return; }
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (!error) { setLoading(false); return; } // onAuthStateChange handles routing
    if (error.message.toLowerCase().includes("not confirmed")) {
      setLoading(false);
      toast({ title: "Verify your email first", description: "Check your inbox for the verification link.", variant: "destructive" });
      return;
    }
    // Treat as new account
    const code = betaCode.trim().toUpperCase();
    let allowed = false;
    if (code) {
      const err = await validateCode(code, cleanEmail);
      if (err) { setLoading(false); toast({ title: "Invalid beta code", description: err, variant: "destructive" }); return; }
      allowed = true;
    } else {
      const { data: emailExists } = await supabase.rpc("check_email_exists", { check_email: cleanEmail });
      allowed = !!emailExists;
    }
    if (!allowed) {
      setLoading(false);
      toast({ title: "Email or password is incorrect", description: "New here? Enter your beta access code to create an account.", variant: "destructive" });
      return;
    }
    const pwErr = validatePassword(password);
    if (pwErr) { setLoading(false); toast({ title: "Weak password", description: pwErr, variant: "destructive" }); return; }
    const { error: suErr } = await supabase.auth.signUp({
      email: cleanEmail, password, options: { emailRedirectTo: `${window.location.origin}/email-verified` },
    });
    if (suErr) {
      setLoading(false);
      toast({
        title: suErr.message.toLowerCase().includes("already registered") ? "Email or password is incorrect" : "Could not create account",
        description: suErr.message.toLowerCase().includes("already registered") ? "Try again or reset your password." : suErr.message,
        variant: "destructive",
      });
      return;
    }
    await supabase.rpc("consume_beta_code" as any, { _code: code || null, _email: cleanEmail, _referred_by: refCodeValue() });
    setSentVerification(true);
    setLoading(false);
  };

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
                    setPassword("");
                  }}
                >
                  Back to sign in
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key={needCode ? "code" : "auth"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  {needCode ? <KeyRound className="w-8 h-8 text-primary" /> : <LogIn className="w-8 h-8 text-primary" />}
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">{needCode ? "Enter your beta code" : "Welcome to RaidFi"}</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  {needCode
                    ? <>RaidFi is in beta. Enter the access code for <span className="text-foreground font-medium">{email}</span> to finish.</>
                    : "Sign in or create your account. New members need a beta code."}
                </p>

                {needCode ? (
                  <form onSubmit={submitCodeForGoogle} className="glass-card p-6 rounded-xl text-left space-y-3">
                    <Input value={betaCode} onChange={(e) => setBetaCode(e.target.value)} placeholder="Beta access code"
                      className="bg-white/[0.05] border-white/[0.1] h-12 tracking-widest uppercase font-mono" aria-label="Beta access code" autoFocus required />
                    <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Continue
                    </Button>
                    <button type="button" className="block w-full text-center text-xs text-muted-foreground hover:text-foreground"
                      onClick={async () => { await supabase.auth.signOut(); setNeedCode(false); }}>Use a different account</button>
                    <p className="text-xs text-muted-foreground text-center">No code? <a href="/beta" className="text-primary hover:underline">Request beta access</a></p>
                  </form>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="glass-card p-6 rounded-xl text-left">
                    <Button type="button" variant="outline" className="w-full h-12 text-base" onClick={handleGoogle} disabled={loading}>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" aria-hidden="true"><path fill="currentColor" d="M21.35 11.1H12v2.98h5.35c-.23 1.5-1.66 4.4-5.35 4.4-3.22 0-5.85-2.67-5.85-5.96S8.78 6.56 12 6.56c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.68 4 14.55 3 12 3 7.03 3 3 7.03 3 12s4.03 9 9 9c5.2 0 8.64-3.65 8.64-8.8 0-.59-.06-1.04-.14-1.5z"/></svg>
                      Continue with Google
                    </Button>
                    <div className="flex items-center gap-3 my-4 text-xs text-muted-foreground">
                      <div className="h-px flex-1 bg-border" />or<div className="h-px flex-1 bg-border" />
                    </div>
                    <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/[0.05] border-white/[0.1] text-foreground h-12 text-base" aria-label="Email address" maxLength={255} autoComplete="email" required />
                    <PasswordInput placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      className="bg-white/[0.05] border-white/[0.1] text-foreground h-12 text-base mt-3" aria-label="Password"
                      maxLength={PASSWORD_MAX_LENGTH} autoComplete="current-password" required />
                    {betaCode.trim() && (passwordFocused || password.length > 0) && (
                      <div className="mt-3 rounded-lg border border-border/70 bg-muted/35 p-3">
                        <PasswordStrength value={password} rules={passwordRequirements} />
                      </div>
                    )}
                    <Input type="text" placeholder="Beta code (new members only)" value={betaCode} onChange={(e) => setBetaCode(e.target.value)}
                      className="bg-white/[0.05] border-white/[0.1] text-foreground h-11 text-sm mt-3 tracking-widest uppercase font-mono" aria-label="Beta access code" />
                    <Button type="submit" className="w-full mt-4 h-12 text-base font-semibold" disabled={loading}>
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Continue
                    </Button>
                    <a href="/forgot-password" className="block text-center text-xs text-muted-foreground hover:text-foreground mt-3">Forgot your password?</a>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    No access yet? <a href="/beta" className="text-primary hover:underline">Request beta access</a>
                  </p>
                </form>
                )}
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
