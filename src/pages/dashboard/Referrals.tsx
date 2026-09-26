import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useContributorData } from "@/hooks/useContributorData";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageHeader, Panel, StatCard } from "@/components/dashboard/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, Copy, Loader2 } from "lucide-react";

const Referrals = () => {
  useSEO({
    title: "Referrals - RaidFi",
    description: "Invite contributors and recommend projects to RaidFi and earn XP.",
    path: "/dashboard/referrals",
  });
  const { session } = useAuth();
  const { toast } = useToast();
  const data = useContributorData(session?.user?.email);

  const [xpPerSignup, setXpPerSignup] = useState(50);
  const [rows, setRows] = useState<any[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ project_name: "", contact_email: "", note: "" });

  const [codes, setCodes] = useState<any[]>([]);
  const load = async () => {
    supabase.rpc("get_my_invite_codes" as any).then(({ data }) => setCodes((data as any[]) ?? []));
    const [{ data: settings }, { data: referrals }] = await Promise.all([
      supabase.from("admin_settings").select("referral_xp_per_signup").eq("id", "global").maybeSingle(),
      supabase.from("project_referrals" as any).select("*").order("created_at", { ascending: false }),
    ]);
    if (settings) {
      setXpPerSignup((settings as any).referral_xp_per_signup ?? 50);
    }
    setRows((referrals as any[]) ?? []);
  };

  useEffect(() => {
    load();
  }, [session?.user?.email]);

  const referralUrl = data.profile?.referral_code
    ? `${window.location.origin}/beta?ref=${data.profile.referral_code}`
    : null;

  const projectUrl = data.profile?.referral_code
    ? `${window.location.origin}/project-request?ref=${data.profile.referral_code}`
    : null;

  const copy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const submitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = session?.user?.email?.toLowerCase();
    if (!email || !form.project_name.trim()) return;
    setSending(true);
    const { error } = await supabase.from("project_referrals" as any).insert({
      referrer_email: email,
      project_name: form.project_name.trim(),
      contact_email: form.contact_email.trim() || null,
      note: form.note.trim() || null,
    } as any);
    setSending(false);
    if (error) {
      toast({ title: "Couldn't submit", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Project recommended", description: "We'll reach out and keep you posted." });
    setForm({ project_name: "", contact_email: "", note: "" });
    load();
  };

  const referralCount = data.profile?.referral_count ?? 0;

  return (
    <DashboardLayout>
      <PageHeader
        title="Referrals"
        subtitle="Invite contributors and recommend projects to earn XP."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <StatCard label="Contributors referred" value={referralCount} accent />
        <StatCard label="XP earned" value={(referralCount * xpPerSignup).toLocaleString()} hint={`+${xpPerSignup} XP each`} />
        <StatCard label="Projects recommended" value={rows.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Referral Links" description={`Share your links to refer contributors (+${xpPerSignup} XP) or invite projects.`}>
          {data.profile?.referral_code ? (
            <div className="space-y-3">
              <div>
                <Label className="text-[11px] text-muted-foreground mb-1 block">Contributor Signup Link</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[11px] px-3 py-2 rounded-md bg-muted text-foreground truncate">{referralUrl}</code>
                  <Button variant="outline" className="h-9" onClick={() => copy(referralUrl!, "ref")}>
                    {copied === "ref" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-[11px] text-muted-foreground mb-1 block">Project Request Link</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[11px] px-3 py-2 rounded-md bg-muted text-foreground truncate">{projectUrl}</code>
                  <Button variant="outline" className="h-9" onClick={() => copy(projectUrl!, "proj")}>
                    {copied === "proj" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No referral code on this account yet.</p>
          )}
        </Panel>

        <Panel title="Your 5 invite codes" description="Each code lets one friend skip the beta queue. Share them one per person.">
          <ul className="space-y-2">
            {codes.map((c) => (
              <li key={c.code} className="flex items-center gap-2">
                <code className={`flex-1 text-xs px-3 py-2 rounded-md bg-muted ${c.used_at ? "line-through text-muted-foreground" : "text-foreground"}`}>{c.code}</code>
                {c.used_at ? (
                  <span className="text-[11px] text-muted-foreground w-10 text-center">Used</span>
                ) : (
                  <Button variant="outline" className="h-9 w-10 p-0" onClick={() => copy(c.code, c.code)}>
                    {copied === c.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                )}
              </li>
            ))}
            {codes.length === 0 && <p className="text-xs text-muted-foreground">Loading codes...</p>}
          </ul>
        </Panel>

        <Panel title="Recommend a project" description="Know a project that needs RaidFi? Introduce them and we'll reach out.">
          <form onSubmit={submitProject} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="r-name">Project name</Label>
              <Input id="r-name" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-email">Contact email or handle</Label>
              <Input id="r-email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} placeholder="founder@project.xyz" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-note">Context</Label>
              <Textarea id="r-note" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Who they are and why they need RaidFi" />
            </div>
            <Button type="submit" disabled={sending} className="h-9 text-sm">
              {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Recommend project
            </Button>
          </form>
        </Panel>

        <div className="lg:col-span-2">
          <Panel title="Your recommended projects" description="Status updates as we move each conversation forward.">
            {rows.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No recommended projects yet.</p>
            ) : (
              <ul className="divide-y divide-border -my-1">
                {rows.map((r) => (
                  <li key={r.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{r.project_name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize shrink-0">
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Referrals;
