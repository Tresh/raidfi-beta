import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { IndividualStep1, IndividualStep2, IndividualStep3, IndividualStep4, IndividualStep5 } from "./IndividualSteps";
import { ProjectStep1, ProjectStep2, ProjectStep3, ProjectStep4, ProjectStep5 } from "./ProjectSteps";

type UserRole = "raider" | "project";

interface ValidationFormProps {
  userId: string;
  userEmail: string;
  onComplete: () => void;
}

const INDIVIDUAL_STEPS = [IndividualStep1, IndividualStep2, IndividualStep3, IndividualStep4, IndividualStep5];
const PROJECT_STEPS = [ProjectStep1, ProjectStep2, ProjectStep3, ProjectStep4, ProjectStep5];

const ValidationForm = ({ userId, userEmail, onComplete }: ValidationFormProps) => {
  const { toast } = useToast();
  const [role, setRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = useCallback((key: string, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const steps = role === "raider" ? INDIVIDUAL_STEPS : role === "project" ? PROJECT_STEPS : [];
  const totalSteps = steps.length;
  const CurrentStep = steps[step];

  const checkDuplicateHandle = async (handle: string): Promise<boolean> => {
    if (!handle) return false;
    const normalized = handle.replace(/^@/, "").toLowerCase().trim();
    if (!normalized) return false;

    const { data: existing } = await supabase
      .from("validation_submissions")
      .select("id")
      .ilike("twitter_handle", normalized)
      .maybeSingle();

    return !!existing;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Check duplicate X handle
      const xHandle = data.x_handle || "";
      if (xHandle) {
        const isDuplicate = await checkDuplicateHandle(xHandle);
        if (isDuplicate) {
          toast({ title: "X handle already registered", description: "This X handle is already associated with another account.", variant: "destructive" });
          setSubmitting(false);
          return;
        }
      }

      const { error } = await supabase.from("validation_submissions").insert({
        user_id: null,
        email: userEmail,
        role: role!,
        name: xHandle || "Anonymous",
        twitter_handle: xHandle ? xHandle.replace(/^@/, "").trim() : null,
        form_responses: data,
      });
      if (error) throw error;

      await supabase
        .from("waitlist_submissions")
        .update({ points: 250 })
        .eq("id", userId);

      toast({ title: "You earned 200 bonus points!", description: "Total: 250 RaidFi Points" });
      onComplete();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Role selection screen
  if (!role) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Which best describes you?</h2>
        <p className="text-sm text-muted-foreground">This helps us tailor the questions for you.</p>
        <div className="grid gap-3 pt-2">
          <button
            onClick={() => { setRole("raider"); setStep(0); }}
            className="text-left glass-card rounded-xl p-5 hover:border-primary/30 transition-colors"
          >
            <p className="font-medium text-foreground">Community / Individual</p>
            <p className="text-sm text-muted-foreground mt-1">I engage with projects, create content, and contribute to communities</p>
          </button>
          <button
            onClick={() => { setRole("project"); setStep(0); }}
            className="text-left glass-card rounded-xl p-5 hover:border-primary/30 transition-colors"
          >
            <p className="font-medium text-foreground">Project / Founder</p>
            <p className="text-sm text-muted-foreground mt-1">I run a project and need contribution intelligence</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => { if (step === 0) setRole(null); else setStep(step - 1); }} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-white/[0.08]"}`} />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{step + 1}/{totalSteps}</span>
      </div>

      {/* Step content */}
      <div className="min-h-[400px] overflow-y-auto">
        {CurrentStep && <CurrentStep data={data} update={update} />}
      </div>

      {/* Navigation */}
      <div className="pt-6 flex gap-3">
        {step < totalSteps - 1 ? (
          <Button onClick={() => setStep(step + 1)} className="flex-1 h-11 font-semibold">
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="flex-1 h-11 font-semibold" disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Claim 200 Points
          </Button>
        )}
      </div>
    </div>
  );
};

export default ValidationForm;
