import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/auth/PasswordInput";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateEmail } from "@/lib/password";
import logo from "@/assets/logo.png";

const hasAdminAccess = async (userId: string) => {
  const [{ data: admin }, { data: superAdmin }, { data: moderator }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" as any }),
    supabase.rpc("has_role", { _user_id: userId, _role: "moderator" }),
  ]);
  return Boolean(admin || superAdmin || moderator);
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && (await hasAdminAccess(session.user.id))) navigate("/admin");
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) {
      toast({ title: "Check your email", description: emailErr, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        throw new Error(
          error.message.toLowerCase().includes("not confirmed")
            ? "Verify your email first - check your inbox for the verification link."
            : "Email or password is incorrect."
        );
      }
      const user = data.session?.user;
      if (!user) throw new Error("Session not found");

      if (!(await hasAdminAccess(user.id))) {
        await supabase.auth.signOut();
        throw new Error("You do not have admin access.");
      }
      navigate("/admin");
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
          <img src={logo} alt="RaidFi" className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in with your admin email and password</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <Input
            type="email"
            placeholder="admin@raidfi.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-card border-border h-11"
            autoComplete="email"
            maxLength={255}
            required
          />
          <PasswordInput
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-card border-border h-11"
            autoComplete="current-password"
            required
          />
          <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sign in
          </Button>
          <a
            href="/forgot-password"
            className="block text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Forgot your password?
          </a>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
