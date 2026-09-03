import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageHeader, Panel, StatusPill } from "@/components/dashboard/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type Kind = "feedback" | "bug" | "report";

const kinds: { value: Kind; label: string }[] = [
  { value: "feedback", label: "Feedback" },
  { value: "bug", label: "Bug" },
  { value: "report", label: "Report" },
];

interface Row {
  id: string;
  kind: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const Feedback = () => {
  useSEO({
    title: "Feedback & Reports - RaidFi",
    description: "Send feedback, report a bug or flag an issue to the RaidFi team.",
    path: "/dashboard/feedback",
  });
  const { session } = useAuth();
  const { toast } = useToast();

  const [kind, setKind] = useState<Kind>("feedback");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from("feedback_reports")
      .select("id,kind,subject,message,status,created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setRows(((data as any) ?? []) as Row[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const submit = async () => {
    if (!session?.user?.id) return;
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Missing details", description: "Add a subject and a message.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("feedback_reports").insert({
      user_id: session.user.id,
      user_email: (session.user.email ?? "").toLowerCase(),
      kind,
      subject: subject.trim(),
      message: message.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not send", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Sent", description: "Thanks - the team will look into it." });
    setSubject("");
    setMessage("");
    load();
  };

  return (
    <DashboardLayout>
      <PageHeader title="Feedback & Reports" subtitle="Tell us what's broken, confusing or missing." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Send something" description="Feedback, bugs and reports all land with the team.">
          <div className="space-y-3">
            <div className="flex gap-2">
              {kinds.map((k) => (
                <button
                  key={k.value}
                  onClick={() => setKind(k.value)}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                    kind === k.value
                      ? "border-primary text-primary bg-primary/10 font-medium"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Short summary"
                className="h-10 text-sm mt-1.5"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Details</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What happened, and what did you expect?"
                className="text-sm mt-1.5 min-h-[120px]"
              />
            </div>
            <Button onClick={submit} disabled={submitting} className="h-9 text-sm">
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit
            </Button>
          </div>
        </Panel>

        <Panel title="Your submissions" description="Everything you've sent us.">
          {rows.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nothing submitted yet.</p>
          ) : (
            <div className="space-y-2.5">
              {rows.map((r) => (
                <div key={r.id} className="border border-border rounded-md p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{r.subject}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{r.message}</p>
                    </div>
                    <StatusPill status={r.status} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-[0.1em]">
                    {r.kind} · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </DashboardLayout>
  );
};

export default Feedback;
