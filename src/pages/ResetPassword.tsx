import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/auth/PasswordInput";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { validatePassword, passwordStrength } from "@/lib/password";
import logo from "@/assets/logo.png";

const ResetPassword = () => {
  useSEO({
    title: "Set a new password — RaidFi",
    description: "Choose a new password for your RaidFi account.",
    path: "/reset-password",
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const strength = passwordStrength(password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validatePassword(password);
    if (err) {
      toast({ title: "Weak password", description: err, variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", description: "Both fields must be identical.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Could not update password", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Password updated", description: "Sign in with your new password." });
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <img src={logo} alt="RaidFi" className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Set a new password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose something you haven't used before.
          </p>
        </div>

        {!ready ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center text-sm text-muted-foreground space-y-4">
            <ShieldCheck className="w-6 h-6 mx-auto text-muted-foreground" />
            <p>
              This page needs a valid reset link. Open the link from your email, or request a new
              one.
            </p>
            <Button variant="outline" asChild className="w-full h-11">
              <a href="/forgot-password">Request a new link</a>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <PasswordInput
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-card border-border h-11"
              autoComplete="new-password"
              required
            />
            {password && (
              <p className="text-[11px] text-muted-foreground">
                Strength: <span className="text-foreground">{strength.label}</span> — use 8+
                characters with upper and lower case letters and a number.
              </p>
            )}
            <PasswordInput
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="bg-card border-border h-11"
              autoComplete="new-password"
              required
            />
            <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
