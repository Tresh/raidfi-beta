import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
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
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  // If already logged in as admin, redirect
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: admin } = await supabase.rpc("has_role", {
          _user_id: session.user.id,
          _role: "admin",
        });
        if (admin) navigate("/admin");
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
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

  const handleVerifyOtp = async () => {
    if (otp.length !== 8) return;
    setVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (error) throw error;

      // Check admin or moderator role
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Session not found");

      const [{ data: admin }, { data: moderator }] = await Promise.all([
        supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" }),
        supabase.rpc("has_role", { _user_id: session.user.id, _role: "moderator" }),
      ]);

      if (!admin && !moderator) {
        await supabase.auth.signOut();
        throw new Error("You do not have admin access.");
      }

      navigate("/admin");
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
      setOtp("");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <img src={logo} alt="RaidFi" className="w-12 h-12 mx-auto mb-4" />
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
              Send Code
            </Button>
          </form>
        ) : (
          <div className="bg-card border border-border p-6 rounded-xl text-center space-y-5">
            <div>
              <p className="text-foreground mb-1">Enter verification code</p>
              <p className="text-sm text-muted-foreground">
                Sent to <span className="text-primary">{email}</span>
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP maxLength={8} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                  <InputOTPSlot index={6} />
                  <InputOTPSlot index={7} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              className="w-full h-11 font-semibold"
              disabled={otp.length !== 8 || verifying}
              onClick={handleVerifyOtp}
            >
              {verifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Verify & Sign In
            </Button>

            <button
              onClick={() => { setSent(false); setEmail(""); setOtp(""); }}
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
