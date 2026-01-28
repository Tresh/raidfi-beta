import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

type UserRole = "raider" | "project";

const Waitlist = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    email: "",
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

  const totalSteps = 4;

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
        return formData.email && formData.name;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.name || !role) {
      toast({
        title: "Please fill in required fields",
        description: "Email, name, and role selection are required.",
        variant: "destructive",
      });
      return;
    }

    console.log("Waitlist submission:", { role, ...formData });
    setSubmitted(true);
    toast({
      title: "You're on the list!",
      description: "We'll be in touch soon.",
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            You're on the waitlist!
          </h2>
          <p className="text-muted-foreground mb-8">
            Thanks for joining. We'll reach out when we're ready to launch.
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
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <img src={logo} alt="Swipht" className="w-8 h-8 rounded-full" />
            <span className="font-medium text-foreground">Swipht</span>
          </button>
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
                    Welcome to Swipht
                  </h1>
                  <p className="text-muted-foreground">
                    First, tell us who you are
                  </p>
                </div>

                <RadioGroup
                  value={role || ""}
                  onValueChange={(value) => setRole(value as UserRole)}
                  className="space-y-3"
                >
                  <div>
                    <RadioGroupItem
                      value="raider"
                      id="raider"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="raider"
                      className="flex flex-col rounded-lg border-2 border-border bg-card p-5 hover:border-primary/50 peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                    >
                      <span className="text-lg font-medium text-foreground">
                        Raider / Community Member
                      </span>
                      <span className="text-sm text-muted-foreground mt-1">
                        I want to participate in raids and earn rewards for my
                        engagement
                      </span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="project"
                      id="project"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="project"
                      className="flex flex-col rounded-lg border-2 border-border bg-card p-5 hover:border-primary/50 peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                    >
                      <span className="text-lg font-medium text-foreground">
                        Project / Influencer
                      </span>
                      <span className="text-sm text-muted-foreground mt-1">
                        I want to create raid pools and grow my project's social
                        presence
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
                    Basic Information
                  </h1>
                  <p className="text-muted-foreground">
                    How can we reach you?
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitterHandle">Twitter / X Handle</Label>
                    <Input
                      id="twitterHandle"
                      name="twitterHandle"
                      type="text"
                      placeholder="@yourhandle"
                      value={formData.twitterHandle}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telegramHandle">Telegram Handle</Label>
                    <Input
                      id="telegramHandle"
                      name="telegramHandle"
                      type="text"
                      placeholder="@yourhandle"
                      value={formData.telegramHandle}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Role-specific questions */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground mb-2">
                    {role === "raider" ? "Your Experience" : "About Your Project"}
                  </h1>
                  <p className="text-muted-foreground">
                    {role === "raider"
                      ? "Tell us about your raiding experience"
                      : "Help us understand your project"}
                  </p>
                </div>

                {role === "raider" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">
                        Have you participated in raids before?
                      </Label>
                      <Textarea
                        id="experience"
                        name="experience"
                        placeholder="Tell us about your experience with raids, shilling, or community engagement..."
                        value={formData.experience}
                        onChange={handleChange}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whyInterested">
                        What interests you about Swipht?
                      </Label>
                      <Textarea
                        id="whyInterested"
                        name="whyInterested"
                        placeholder="What excites you about RaidFi and getting rewarded for quality engagement?"
                        value={formData.whyInterested}
                        onChange={handleChange}
                        rows={4}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="projectName">Project / Brand Name</Label>
                      <Input
                        id="projectName"
                        name="projectName"
                        type="text"
                        placeholder="Your project name"
                        value={formData.projectName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="projectWebsite">Project Website</Label>
                      <Input
                        id="projectWebsite"
                        name="projectWebsite"
                        type="url"
                        placeholder="https://yourproject.com"
                        value={formData.projectWebsite}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="projectDescription">
                        Tell us about your project
                      </Label>
                      <Textarea
                        id="projectDescription"
                        name="projectDescription"
                        placeholder="What does your project do? What stage are you at?"
                        value={formData.projectDescription}
                        onChange={handleChange}
                        rows={4}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Final validation */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground mb-2">
                    Almost Done
                  </h1>
                  <p className="text-muted-foreground">
                    {role === "raider"
                      ? "One last thing before you join"
                      : "Final details about your campaign plans"}
                  </p>
                </div>

                {role === "raider" ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-card border border-border rounded-lg">
                      <p className="text-sm text-foreground mb-3">
                        By joining the waitlist, you confirm that:
                      </p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          You're interested in earning rewards for quality engagement
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          You understand rewards are based on AI-evaluated quality
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          You're ready to be part of the RaidFi revolution
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="expectedBudget">
                        What's your expected monthly budget for raids?
                      </Label>
                      <Input
                        id="expectedBudget"
                        name="expectedBudget"
                        type="text"
                        placeholder="e.g., $500-$1000, 10,000 tokens, etc."
                        value={formData.expectedBudget}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="p-4 bg-card border border-border rounded-lg">
                      <p className="text-sm text-foreground mb-3">
                        As a project, you'll be able to:
                      </p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          Create raid pools with custom rules and rewards
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          Access AI-ranked engagement metrics
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          Get transparent ROI on your social campaigns
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              {step > 1 ? (
                <Button type="button" variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit">Join Waitlist</Button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Waitlist;
