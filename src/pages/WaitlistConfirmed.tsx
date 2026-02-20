import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Gift, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

type UserRole = "raider" | "project";

const WaitlistConfirmed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Validation form state
  const [role, setRole] = useState<UserRole | null>(null);
  const [twitterHandle, setTwitterHandle] = useState("");
  const [heardFrom, setHeardFrom] = useState("");
  const [raidFrequency, setRaidFrequency] = useState("");
  const [chains, setChains] = useState("");
  const [communitySize, setCommunitySize] = useState("");

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setAuthenticated(true);
        setUserEmail(session.user.email || "");
        setUserId(session.user.id);

        // Save waitlist entry
        await supabase.from("waitlist_submissions").upsert(
          { user_id: session.user.id, email: session.user.email || "", points: 50 },
          { onConflict: "email" }
        );

        setLoading(false);
      } else {
        // Listen for auth state change (magic link callback)
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

        // Timeout fallback
        setTimeout(() => setLoading(false), 3000);

        return () => subscription.unsubscribe();
      }
    };

    handleAuth();
  }, []);

  const handleSubmitValidation = async () => {
    if (!role) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("validation_submissions").insert({
        user_id: userId,
        email: userEmail,
        role,
        name: twitterHandle || "Anonymous",
        twitter_handle: twitterHandle || null,
        why_interested: heardFrom || null,
        experience: raidFrequency || null,
        project_name: chains || null,
        project_description: communitySize || null,
      });
      if (error) throw error;

      await supabase
        .from("waitlist_submissions")
        .update({ points: 250 })
        .eq("user_id", userId);

      setCompleted(true);
      toast({ title: "You earned 200 bonus points!", description: "Total: 250 RaidFi Points" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

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
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Verification expired
          </h2>
          <p className="text-muted-foreground mb-6">
            This link may have expired or already been used. Please try again.
          </p>
          <Button onClick={() => navigate("/waitlist")}>
            Back to Waitlist
          </Button>
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
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            You're all set
          </h2>
          <p className="text-primary font-semibold text-lg mb-1">250 RaidFi Points</p>
          <p className="text-muted-foreground mb-8">
            We'll reach out with early access details. The more points you have, the sooner you get in.
          </p>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
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
              <h1 className="text-3xl font-bold text-foreground mb-3">
                Email verified
              </h1>
              <p className="text-muted-foreground mb-2">
                You're on the waitlist as <span className="text-foreground font-medium">{userEmail}</span>
              </p>
              <p className="text-primary font-semibold text-lg mb-8">
                +50 RaidFi Points earned
              </p>

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
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors text-center block"
                >
                  Maybe later
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Quick questions
              </h1>
              <p className="text-muted-foreground mb-8">
                Help us build RaidFi for you. Earn <span className="text-primary font-semibold">200 bonus points</span>.
              </p>

              <div className="space-y-6">
                {/* Q1: Role */}
                <div className="space-y-3">
                  <Label className="text-foreground font-medium">I want to use RaidFi as a… *</Label>
                  <RadioGroup value={role || ""} onValueChange={(v) => setRole(v as UserRole)} className="space-y-2">
                    <div>
                      <RadioGroupItem value="raider" id="raider" className="peer sr-only" />
                      <Label
                        htmlFor="raider"
                        className="flex items-center gap-3 glass-card rounded-lg px-4 py-3 hover:border-primary/50 peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                      >
                        <span className="text-foreground">Raider — I engage with content for rewards</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="project" id="project" className="peer sr-only" />
                      <Label
                        htmlFor="project"
                        className="flex items-center gap-3 glass-card rounded-lg px-4 py-3 hover:border-primary/50 peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                      >
                        <span className="text-foreground">Project — I want to run raid campaigns</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Q2: Twitter */}
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="text-foreground font-medium">Your Twitter / X handle</Label>
                  <Input
                    id="twitter"
                    placeholder="@yourhandle"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    className="bg-white/[0.05] border-white/[0.1]"
                  />
                </div>

                {/* Q3: How did you hear */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">How did you hear about RaidFi?</Label>
                  <Select value={heardFrom} onValueChange={setHeardFrom}>
                    <SelectTrigger className="bg-white/[0.05] border-white/[0.1]">
                      <SelectValue placeholder="Select one" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter / X</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                      <SelectItem value="discord">Discord</SelectItem>
                      <SelectItem value="friend">Friend or referral</SelectItem>
                      <SelectItem value="search">Search engine</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Q4: Raid frequency */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">How often do you participate in raids?</Label>
                  <Select value={raidFrequency} onValueChange={setRaidFrequency}>
                    <SelectTrigger className="bg-white/[0.05] border-white/[0.1]">
                      <SelectValue placeholder="Select one" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="few-times-week">A few times a week</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="rarely">Rarely</SelectItem>
                      <SelectItem value="never">Never — I'm new to this</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Q5: Chains */}
                <div className="space-y-2">
                  <Label htmlFor="chains" className="text-foreground font-medium">What chains or ecosystems are you active in?</Label>
                  <Input
                    id="chains"
                    placeholder="e.g., Solana, Ethereum, Base"
                    value={chains}
                    onChange={(e) => setChains(e.target.value)}
                    className="bg-white/[0.05] border-white/[0.1]"
                  />
                </div>

                {/* Q6: Community size */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">What's your Twitter / X follower count?</Label>
                  <Select value={communitySize} onValueChange={setCommunitySize}>
                    <SelectTrigger className="bg-white/[0.05] border-white/[0.1]">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-500">Under 500</SelectItem>
                      <SelectItem value="500-2k">500 – 2,000</SelectItem>
                      <SelectItem value="2k-10k">2,000 – 10,000</SelectItem>
                      <SelectItem value="10k-50k">10,000 – 50,000</SelectItem>
                      <SelectItem value="50k+">50,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleSubmitValidation}
                    className="w-full h-12 font-semibold"
                    disabled={!role || submitting}
                  >
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Claim 200 Points
                  </Button>
                  <button
                    onClick={() => navigate("/")}
                    className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors text-center block"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WaitlistConfirmed;
