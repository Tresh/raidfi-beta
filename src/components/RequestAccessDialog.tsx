import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

const RequestAccessDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  // Beta form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [reason, setReason] = useState("");

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) setTimeout(() => setDone(false), 200);
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
      requested_role: "user",
      reason: reason.trim() || null,
      status: "pending",
    } as any);
    setSending(false);
    if (error) {
      toast({ title: "Couldn't send request", description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl">
        {done ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
            <h3 className="text-lg font-semibold text-foreground">Request received</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              We review beta requests in batches. If you're approved, we'll email you an access code and its expiry date.
            </p>
            <Button variant="outline" onClick={() => close(false)}>Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request access</DialogTitle>
              <DialogDescription>
                Contributor beta is invite-only. Projects, listings and partnerships use a separate request form.
              </DialogDescription>
            </DialogHeader>

                <form onSubmit={submitBeta} className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="ra-name">Name</Label>
                    <Input id="ra-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ra-email">Email</Label>
                    <Input id="ra-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ra-x">X handle</Label>
                    <Input id="ra-x" value={xHandle} onChange={(e) => setXHandle(e.target.value)} placeholder="@handle" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ra-why">Why do you want access?</Label>
                    <Textarea id="ra-why" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="What you'd use RaidFi for" />
                  </div>
                  <Button type="submit" className="w-full" disabled={sending}>
                    {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Request beta access
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Representing a project? <a href="/project-request" className="text-primary underline underline-offset-4">Open the project form</a>
                  </p>
                </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RequestAccessDialog;
