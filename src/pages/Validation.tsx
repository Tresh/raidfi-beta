import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ArrowLeft, ArrowRight, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

type UserRole = "raider" | "project";

const Validation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const email = (location.state as { email?: string })?.email || "";

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    twitterHandle: "",
    telegramHandle: "",
    whyInterested: "",
    experience: "",
    projectName: "",
    projectDescription: "",
    projectWebsite: "",
    expectedBudget: "",
  });

  const totalSteps = 3;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return role !== null;
      case 2:
        return formData.name;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !formData.name) {
      toast({
        title: "Please fill in required fields",
        description: "Name and role selection are required.",
        variant: "destructive",
      });
      return;
    }
    console.log("Validation submission:", { email, role, ...formData });
    setSubmitted(true);
    toast({
      title: "You earned 200 RaidFi Points!",
      description: "Thanks for completing the validation.",
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 glow-cyan">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            +200 RaidFi Points earned!
          </h2>
          <p className="text-primary font-semibold mb-1">Total: 250 Points</p>
          <p className="text-muted-foreground mb-8">
            You're all set. We'll reach out with early access details.
          </p>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 glass">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <img src={logo} alt="Swipht" className="w-8 h-8 rounded-full" />
            <span className="font-medium text-foreground">Swipht</span>
          </button>
          <span className="text-xs text-primary font-medium px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            +200 pts available
          </span>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-lg mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Step {step} of {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round((step / totalSteps) * 100)}%
              </span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground mb-2">
                    Who are you?
                  </h1>
                  <p className="text-muted-foreground">
                    This helps us tailor your experience
                  </p>
                </div>

                <RadioGroup
                  value={role || ""}
                  onValueChange={(v) => setRole(v as UserRole)}
                  className="space-y-3"
                >
                  <div>
                    <RadioGroupItem value="raider" id="raider" className="peer sr-only" />
                    <Label
                      htmlFor="raider"
                      className="flex flex-col glass-card rounded-lg p-5 hover:border-primary/50 peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                    >
                      <span className="text-lg font-medium text-foreground">
                        Raider / Community Member
                      </span>
                      <span className="text-sm text-muted-foreground mt-1">
                        Participate in raids and earn rewards for engagement
                      </span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="project" id="project" className="peer sr-only" />
                    <Label
                      htmlFor="project"
                      className="flex flex-col glass-card rounded-lg p-5 hover:border-primary/50 peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                    >
                      <span className="text-lg font-medium text-foreground">
                        Project / Influencer
                      </span>
                      <span className="text-sm text-muted-foreground mt-1">
                        Create raid pools and grow your social presence
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Step 2: Basic Info */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground mb-2">
                    Tell us about yourself
                  </h1>
                  <p className="text-muted-foreground">Quick details so we know you</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" name="name" placeholder="Your name" value={formData.name} onChange={handleChange} className="bg-white/[0.05] border-white/[0.1]" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitterHandle">Twitter / X Handle</Label>
                    <Input id="twitterHandle" name="twitterHandle" placeholder="@yourhandle" value={formData.twitterHandle} onChange={handleChange} className="bg-white/[0.05] border-white/[0.1]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telegramHandle">Telegram Handle</Label>
                    <Input id="telegramHandle" name="telegramHandle" placeholder="@yourhandle" value={formData.telegramHandle} onChange={handleChange} className="bg-white/[0.05] border-white/[0.1]" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Role-specific */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground mb-2">
                    {role === "raider" ? "Your Experience" : "About Your Project"}
                  </h1>
                  <p className="text-muted-foreground">
                    {role === "raider" ? "Tell us about your raiding experience" : "Help us understand your project"}
                  </p>
                </div>

                {role === "raider" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Have you participated in raids before?</Label>
                      <Textarea id="experience" name="experience" placeholder="Tell us about your experience..." value={formData.experience} onChange={handleChange} rows={4} className="bg-white/[0.05] border-white/[0.1]" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whyInterested">What interests you about Swipht?</Label>
                      <Textarea id="whyInterested" name="whyInterested" placeholder="What excites you about RaidFi?" value={formData.whyInterested} onChange={handleChange} rows={4} className="bg-white/[0.05] border-white/[0.1]" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="projectName">Project / Brand Name</Label>
                      <Input id="projectName" name="projectName" placeholder="Your project name" value={formData.projectName} onChange={handleChange} className="bg-white/[0.05] border-white/[0.1]" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectWebsite">Project Website</Label>
                      <Input id="projectWebsite" name="projectWebsite" type="url" placeholder="https://yourproject.com" value={formData.projectWebsite} onChange={handleChange} className="bg-white/[0.05] border-white/[0.1]" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectDescription">Tell us about your project</Label>
                      <Textarea id="projectDescription" name="projectDescription" placeholder="What does your project do?" value={formData.projectDescription} onChange={handleChange} rows={4} className="bg-white/[0.05] border-white/[0.1]" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expectedBudget">Expected monthly budget for raids?</Label>
                      <Input id="expectedBudget" name="expectedBudget" placeholder="e.g., $500-$1000" value={formData.expectedBudget} onChange={handleChange} className="bg-white/[0.05] border-white/[0.1]" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
              {step > 1 ? (
                <Button type="button" variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < totalSteps ? (
                <Button type="button" onClick={handleNext} disabled={!canProceed()}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit">
                  Claim 200 Points
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Validation;
