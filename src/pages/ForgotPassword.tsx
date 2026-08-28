import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { validateEmail } from "@/lib/password";
import logo from "@/assets/logo.png";

const ForgotPassword = () => {
  useSEO({
    title: "Reset your password — RaidFi",
    description: "Request a password reset link for your RaidFi account.",
    path: "/forgot-password",
  });

  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      toast({ title: "Check your email", description: err, variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Could not send link", description: error.message, variant: "destructive" });
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <img src={logo} alt="RaidFi" className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Forgot your password?</h1>
          <p className="text-sm text-muted-foreground mt-1">
            We'll email you a link to set a new one.
          </p>
        </div>

        {sent ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              If an account exists for <span className="text-foreground">{email}</span>, a reset link
              is on its way. The link expires shortly.
            </p>
            <Button variant="outline" asChild className="w-full h-11">
              <a href="/login">Back to login</a>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-card border-border h-11"
              maxLength={255}
              required
            />
            <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send reset link
            </Button>
            <a
              href="/login"
              className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to login
            </a>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
