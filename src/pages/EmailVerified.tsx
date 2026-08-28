import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import logo from "@/assets/logo.png";

const EmailVerified = () => {
  useSEO({
    title: "Email verified — RaidFi",
    description: "Your RaidFi email address has been verified.",
    path: "/email-verified",
  });

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // The verification link establishes a session; sign out so the user logs in explicitly.
    const run = async () => {
      await supabase.auth.getSession();
      setChecking(false);
    };
    run();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <img src={logo} alt="RaidFi" className="w-12 h-12 mx-auto mb-6" />
        {checking ? (
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Email verified</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Your email address is confirmed. You can now sign in with your password.
            </p>
            <Button asChild className="w-full h-11">
              <a href="/login">Go to login</a>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerified;
