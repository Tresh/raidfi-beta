import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserRole = "raider" | "project";

const WaitlistForm = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [role, setRole] = useState<UserRole>("raider");
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    twitterHandle: "",
    whyInterested: "",
    projectName: "",
    projectDescription: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.name) {
      toast({
        title: "Please fill in required fields",
        description: "Email and name are required.",
        variant: "destructive",
      });
      return;
    }

    // For now, just show success (will connect to Supabase later)
    console.log("Waitlist submission:", { role, ...formData });
    setSubmitted(true);
    toast({
      title: "You're on the list!",
      description: "We'll be in touch soon.",
    });
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          You're on the waitlist!
        </h3>
        <p className="text-muted-foreground">
          We'll reach out when we're ready to launch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Role Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">I am a...</Label>
        <RadioGroup
          value={role}
          onValueChange={(value) => setRole(value as UserRole)}
          className="grid grid-cols-2 gap-3"
        >
          <div>
            <RadioGroupItem
              value="raider"
              id="raider"
              className="peer sr-only"
            />
            <Label
              htmlFor="raider"
              className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
            >
              <span className="font-medium">Raider / Community</span>
              <span className="text-xs text-muted-foreground mt-1">
                I want to participate in raids
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
              className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
            >
              <span className="font-medium">Project / Influencer</span>
              <span className="text-xs text-muted-foreground mt-1">
                I want to create raid pools
              </span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Common Fields */}
      <div className="grid gap-4">
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
      </div>

      {/* Conditional Fields based on Role */}
      {role === "raider" && (
        <div className="space-y-2">
          <Label htmlFor="whyInterested">
            Why are you interested in Swipht?
          </Label>
          <Textarea
            id="whyInterested"
            name="whyInterested"
            placeholder="Tell us what excites you about RaidFi..."
            value={formData.whyInterested}
            onChange={handleChange}
            rows={3}
          />
        </div>
      )}

      {role === "project" && (
        <div className="grid gap-4">
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
            <Label htmlFor="projectDescription">
              Tell us about your project
            </Label>
            <Textarea
              id="projectDescription"
              name="projectDescription"
              placeholder="What does your project do? How do you plan to use Swipht?"
              value={formData.projectDescription}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" size="lg">
        Join Waitlist
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By joining, you agree to receive updates about Swipht.
      </p>
    </form>
  );
};

export default WaitlistForm;
