import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ROLES = [
  { value: "contributor", label: "Contributor" },
  { value: "community_manager", label: "Community Manager" },
  { value: "founder", label: "Founder" },
  { value: "builder", label: "Builder" },
  { value: "other", label: "Other" },
];

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

const RequestAccessDialog = ({
  open,
  onOpenChange,
  defaultTab = "beta",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultTab?: "beta" | "project";
}) => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | "beta" | "project">(null);

  // Beta form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [role, setRole] = useState("contributor");
  const [reason, setReason] = useState("");

  // Project form
  const [pName, setPName] = useState("");
  const [pSite, setPSite] = useState("");
  const [pX, setPX] = useState("");
  const [pTg, setPTg] = useState("");
  const [pDiscord, setPDiscord] = useState("");
  const [pFounder, setPFounder] = useState("");
  const [pEmail, setPEmail] = useState("");
  const [pWhy, setPWhy] = useState("");

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) setTimeout(() => setDone(null), 200);
  };

  const submitBeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !emailOk(email)) {
      toast({ title: "Check your details", description: "Add your name and a valid email address.", variant: "destructive" });
      return;
    }
    setSending(true);
    const { error } = await supabase.from("beta_requests").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      x_handle: xHandle.trim().replace(/^@/, "") || null,
      requested_role: role,
      reason: reason.trim() || null,
    } as any);
    setSending(false);
    if (error) {
      toast({ title: "Couldn't send request", description: error.message, variant: "destructive" });
      return;
    }
    setDone("beta");
  };

  const submitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !pFounder.trim() || !emailOk(pEmail)) {
      toast({ title: "Check your details", description: "Project name, founder and a valid email are required.", variant: "destructive" });
      return;
    }
    setSending(true);
    const { error } = await supabase.from("project_requests").insert({
      project_name: pName.trim(),
      website: pSite.trim() || null,
      x_handle: pX.trim().replace(/^@/, "") || null,
      telegram: pTg.trim() || null,
      discord: pDiscord.trim() || null,
      founder_name: pFounder.trim(),
      email: pEmail.trim().toLowerCase(),
      why: pWhy.trim() || null,
    } as any);
    setSending(false);
    if (error) {
      toast({ title: "Couldn't send request", description: error.message, variant: "destructive" });
      return;
    }
    setDone("project");
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl">
        {done ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
            <h3 className="text-lg font-semibold text-foreground">Request received</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {done === "beta"
                ? "We review beta requests in batches. If you're approved, we'll email you an access code and its expiry date."
                : "We'll review your project and email the founder address once it's approved, along with your access code."}
            </p>
            <Button variant="outline" onClick={() => close(false)}>Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request access</DialogTitle>
              <DialogDescription>
                RaidFi is in private beta. Tell us who you are and we'll send an access code.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue={defaultTab}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="beta">I'm a contributor</TabsTrigger>
                <TabsTrigger value="project">I'm a project</TabsTrigger>
              </TabsList>

              <TabsContent value="beta">
                <form onSubmit={submitBeta} className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="ra-name">Name</Label>
                    <Input id="ra-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ra-email">Email</Label>
                    <Input id="ra-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="ra-x">X handle</Label>
                      <Input id="ra-x" value={xHandle} onChange={(e) => setXHandle(e.target.value)} placeholder="@handle" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Role</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ra-why">Why do you want access?</Label>
                    <Textarea id="ra-why" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="What you'd use RaidFi for" />
                  </div>
                  <Button type="submit" className="w-full" disabled={sending}>
                    {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Request beta access
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="project">
                <form onSubmit={submitProject} className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="rp-name">Project name</Label>
                    <Input id="rp-name" value={pName} onChange={(e) => setPName(e.target.value)} placeholder="Acme Protocol" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="rp-site">Website</Label>
                      <Input id="rp-site" value={pSite} onChange={(e) => setPSite(e.target.value)} placeholder="https://" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rp-x">X</Label>
                      <Input id="rp-x" value={pX} onChange={(e) => setPX(e.target.value)} placeholder="@project" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rp-tg">Telegram</Label>
                      <Input id="rp-tg" value={pTg} onChange={(e) => setPTg(e.target.value)} placeholder="t.me/…" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rp-dc">Discord</Label>
                      <Input id="rp-dc" value={pDiscord} onChange={(e) => setPDiscord(e.target.value)} placeholder="discord.gg/…" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rp-founder">Founder</Label>
                      <Input id="rp-founder" value={pFounder} onChange={(e) => setPFounder(e.target.value)} placeholder="Full name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rp-email">Email</Label>
                      <Input id="rp-email" type="email" value={pEmail} onChange={(e) => setPEmail(e.target.value)} placeholder="founder@project.xyz" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rp-why">Why do you want RaidFi?</Label>
                    <Textarea id="rp-why" rows={3} value={pWhy} onChange={(e) => setPWhy(e.target.value)} placeholder="What you want to measure or reward" />
                  </div>
                  <Button type="submit" className="w-full" disabled={sending}>
                    {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Request project access
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RequestAccessDialog;
