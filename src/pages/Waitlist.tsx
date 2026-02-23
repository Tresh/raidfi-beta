import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const Waitlist = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      // Check if email is already on the waitlist
      const { data: existing } = await supabase
        .from("waitlist_submissions")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Already registered",
          description: "This email is already on the waitlist.",
        });
        navigate("/");
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/waitlist/confirmed`,
        },
      });
      if (error) throw error;
      setSent(true);
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
      <header className="border-b border-border/50 glass">
        <div className="container mx-auto px-6 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <img src={logo} alt="RaidFi" className="w-8 h-8 rounded-full" />
            <span className="font-medium text-foreground">RaidFi</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          {!sent ? (
            <>
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
                    Verify Email
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  No spam. Unsubscribe anytime.
                </p>
              </form>
            </>
          ) : (
            <div className="glass-card p-8 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                Check your email
              </h2>
              <p className="text-muted-foreground mb-2">
                We sent a verification link to
              </p>
              <p className="text-primary font-medium mb-6">{email}</p>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to confirm and join the waitlist.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Waitlist;
