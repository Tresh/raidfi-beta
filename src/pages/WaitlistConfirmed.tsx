import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Gift, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import ValidationForm from "@/components/validation/ValidationForm";

const WaitlistConfirmed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setAuthenticated(true);
        setUserEmail(session.user.email || "");
        setUserId(session.user.id);

        await supabase.from("waitlist_submissions").upsert(
          { user_id: session.user.id, email: session.user.email || "", points: 50 },
          { onConflict: "email" }
        );

        setLoading(false);
      } else {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === "SIGNED_IN" && session?.user) {
              setAuthenticated(true);
              setUserEmail(session.user.email || "");
              setUserId(session.user.id);

              await supabase.from("waitlist_submissions").upsert(
                { user_id: session.user.id, email: session.user.email || "", points: 50 },
                { onConflict: "email" }
              );

              setLoading(false);
            }
          }
        );

        setTimeout(() => setLoading(false), 3000);
        return () => subscription.unsubscribe();
      }
    };

    handleAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-foreground mb-3">Verification expired</h2>
          <p className="text-muted-foreground mb-6">This link may have expired or already been used. Please try again.</p>
          <Button onClick={() => navigate("/waitlist")}>Back to Waitlist</Button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">You're all set</h2>
          <p className="text-primary font-semibold text-lg mb-1">250 RaidFi Points</p>
          <p className="text-muted-foreground mb-8">We'll reach out with early access details. The more points you have, the sooner you get in.</p>
          <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 glass">
        <div className="container mx-auto px-6 py-4">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} alt="RaidFi" className="w-8 h-8 rounded-full" />
            <span className="font-medium text-foreground">RaidFi</span>
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full">
          {!showValidation ? (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-3">Email verified</h1>
              <p className="text-muted-foreground mb-2">
                You're on the waitlist as <span className="text-foreground font-medium">{userEmail}</span>
              </p>
              <p className="text-primary font-semibold text-lg mb-8">+50 RaidFi Points earned</p>

              <div className="glass-card rounded-xl p-8 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Earn 200 bonus points</p>
                    <p className="text-sm text-muted-foreground">Answer a few quick questions to boost your priority</p>
                  </div>
                </div>
                <Button onClick={() => setShowValidation(true)} className="w-full h-12 font-semibold">
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <button onClick={() => navigate("/")} className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors text-center block">
                  Maybe later
                </button>
              </div>
            </div>
          ) : (
            <ValidationForm userId={userId} userEmail={userEmail} onComplete={() => setCompleted(true)} />
          )}
        </div>
      </main>
    </div>
  );
};

export default WaitlistConfirmed;
