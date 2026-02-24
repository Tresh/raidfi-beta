import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <img src={logo} alt="RaidFi" className="w-12 h-12 rounded-full mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in with your admin email</p>
        </div>

        {!sent ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="admin@raidfi.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-card border-border h-11"
              required
            />
            <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Magic Link
            </Button>
          </form>
        ) : (
          <div className="glass-card p-6 rounded-xl text-center">
            <p className="text-foreground mb-2">Check your email</p>
            <p className="text-sm text-muted-foreground mb-4">
              We sent a login link to <span className="text-primary">{email}</span>
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Try a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
