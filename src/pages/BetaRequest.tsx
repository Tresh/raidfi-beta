import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";

const PLATFORMS = ["X", "Discord", "Telegram"];

const emailOk = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

const BetaRequest = () => {
  useSEO({
    title: "Request Beta Access - RaidFi",
    description:
      "RaidFi is contribution intelligence and reputation infrastructure for Web3. Request access to the private beta.",
    path: "/beta",
  });
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref") || searchParams.get("referred_by");
    if (ref) {
      sessionStorage.setItem("raidfi_ref_code", ref.trim());
    }
  }, [searchParams]);
  const [done, setDone] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [referredBy, setReferredBy] = useState("");

  const [platforms, setPlatforms] = useState<string[]>(["X"]);
  const [reason, setReason] = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref") || searchParams.get("referred_by") || sessionStorage.getItem("raidfi_ref_code");
    if (ref) {
      setReferredBy(ref.trim());
    }
  }, [searchParams]);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !emailOk(email)) {
      toast({ title: "Check your details", description: "Add your name and a valid email address.", variant: "destructive" });
      return;
    }
    setSending(true);
    const notes = [
      reason.trim(),
      platforms.length ? `Platforms: ${platforms.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const refCode = referredBy.trim() || searchParams.get("ref") || searchParams.get("referred_by") || sessionStorage.getItem("raidfi_ref_code") || null;

    const payload: any = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      x_handle: xHandle.trim().replace(/^@/, "") || null,
      requested_role: "user",
      reason: notes || null,
      status: "pending",
    };
    if (refCode) {
      payload.referred_by = refCode;
    }

    let { error } = await supabase.from("beta_requests").insert(payload as any);

    if (error && error.message?.toLowerCase().includes("referred_by")) {
      delete payload.referred_by;
      if (refCode) {
        payload.reason = [notes, `Referred by: ${refCode}`].filter(Boolean).join("\n");
      }
      const res = await supabase.from("beta_requests").insert(payload as any);
      error = res.error;
    }
    setSending(false);
    if (error) {
      toast({ title: "Couldn't send request", description: error.message, variant: "destructive" });
      return;
    }
    supabase.functions.invoke("beta-approve", { body: { action: "welcome", email: email.trim().toLowerCase() } });
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-28 pb-20 max-w-xl">
        {done ? (
          <div className="text-center space-y-4 py-12">
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Request received</h1>
            <p className="text-sm text-muted-foreground">
              We review beta requests in batches. If you're approved we'll email you an access code
              and the date it expires.
            </p>
            <Button variant="outline" asChild><a href="/">Back to home</a></Button>
          </div>
        ) : (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Request beta access</h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                RaidFi turns community activity into structured contribution data and a lasting
                reputation record. The beta is invite-only while we tune how contribution is measured.
              </p>
            </header>

            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="beta-name">Name</Label>
                <Input id="beta-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="beta-email">Email</Label>
                <Input id="beta-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="beta-x">X handle</Label>
                <Input id="beta-x" value={xHandle} onChange={(e) => setXHandle(e.target.value)} placeholder="@handle" />
              </div>


              <div className="space-y-2">
                <Label>Where are you active? (select all that apply)</Label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((platform) => (
                    <label key={platform} className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-lg px-3 py-2 cursor-pointer hover:text-foreground transition-colors">
                      <Checkbox checked={platforms.includes(platform)} onCheckedChange={() => toggle(platforms, setPlatforms, platform)} />
                      {platform}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="beta-why">Why do you want to join? (optional)</Label>
                <Textarea id="beta-why" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="A sentence or two about your work in Web3" />
              </div>

              <Button type="submit" className="w-full" disabled={sending}>
                {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Request beta access
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Representing a project?{" "}
                <a href="/project-request" className="text-primary underline underline-offset-4">Open project application form</a>
              </p>
            </form>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BetaRequest;
