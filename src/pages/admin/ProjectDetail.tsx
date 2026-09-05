import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Users, Save, Trash2, Plus, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatCard } from "@/components/dashboard/Primitives";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const STATUSES = ["active", "paused", "archived"];
const TIERS = ["unverified", "basic", "verified", "partner"];

interface MemberRow {
  id: string;
  email: string;
  member_role: string;
  user_id: string | null;
}

const AdminProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<any | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("manager");
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; desc: string; fn: () => void }>({
    open: false, title: "", desc: "", fn: () => {},
  });

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [{ data: p }, { data: m }, { data: c }] = await Promise.all([
      supabase.from("projects" as any).select("*").eq("id", id).maybeSingle(),
      supabase.from("project_members" as any).select("id,email,member_role,user_id").eq("project_id", id),
      supabase
        .from("contributions" as any)
        .select("id,user_email,post_url,status,points_earned,created_at,manual_score,ai_score")
        .eq("project_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    setProject((p as any) ?? null);
    setMembers(((m as any) ?? []) as MemberRow[]);
    setContributions(((c as any) ?? []) as any[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const patch = (field: string, value: unknown) => setProject((prev: any) => ({ ...prev, [field]: value }));

  const stats = useMemo(() => {
    const approved = contributions.filter((c) => c.status === "approved");
    const contributors = new Set(contributions.map((c) => String(c.user_email).toLowerCase()));
    return {
      total: contributions.length,
      approved: approved.length,
      pending: contributions.filter((c) => c.status !== "approved" && c.status !== "rejected").length,
      contributors: contributors.size,
    };
  }, [contributions]);

  const save = async () => {
    if (!project) return;
    setSaving(true);
    const { error } = await supabase
      .from("projects" as any)
      .update({
        name: project.name,
        slug: project.slug,
        website: project.website,
        x_handle: project.x_handle,
        telegram: project.telegram,
        discord: project.discord,
        founder_name: project.founder_name,
        contact_email: project.contact_email,
        description: project.description,
        verification: project.verification,
        status: project.status,
        trust_score: Number(project.trust_score) || 0,
        telegram_group_id: project.telegram_group_id,
        telegram_bot_added: project.telegram_bot_added,
        x_verified: project.x_verified,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", project.id);
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Project updated" });
    load();
  };

  const addMember = async () => {
    if (!project || !newMemberEmail.trim()) return;
    const email = newMemberEmail.trim().toLowerCase();
    const { error } = await supabase.from("project_members" as any).insert({
      project_id: project.id,
      email,
      member_role: newMemberRole,
    } as any);
    if (error) {
      toast({ title: "Could not add member", description: error.message, variant: "destructive" });
      return;
    }
    setNewMemberEmail("");
    toast({ title: "Member added", description: `${email} can now open this workspace.` });
    load();
  };

  const removeMember = async (mid: string) => {
    await supabase.from("project_members" as any).delete().eq("id", mid);
    load();
  };

  if (loading) {
    return <div className="py-20 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;
  }

  if (!project) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-sm text-muted-foreground">That project no longer exists.</p>
        <Link to="/admin/manage-projects" className="text-sm text-primary underline underline-offset-4">Back to projects</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <button onClick={() => navigate("/admin/manage-projects")} className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3 h-3" /> All projects
          </button>
          <h1 className="text-lg font-semibold text-foreground">{project.name}</h1>
          <p className="text-[11px] text-muted-foreground">/{project.slug} · {project.contact_email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/p/${project.slug}`} className="text-xs text-primary inline-flex items-center gap-1">
            Public page <ExternalLink className="w-3 h-3" />
          </Link>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
            Save changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Contributions" value={stats.total} accent />
        <StatCard label="Approved" value={stats.approved} />
        <StatCard label="Awaiting review" value={stats.pending} />
        <StatCard label="Contributors" value={stats.contributors} />
      </div>

      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ["Name", "name"], ["Slug", "slug"], ["Contact email", "contact_email"], ["Founder", "founder_name"],
            ["Website", "website"], ["X handle", "x_handle"], ["Telegram", "telegram"], ["Telegram group ID", "telegram_group_id"],
          ].map(([label, field]) => (
            <div key={field} className="space-y-1.5">
              <Label className="text-xs">{label}</Label>
              <Input value={project[field] ?? ""} onChange={(e) => patch(field, e.target.value)} className="h-9 text-xs" />
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Description</Label>
          <Textarea value={project.description ?? ""} onChange={(e) => patch("description", e.target.value)} rows={3} className="text-xs" />
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={project.status} onValueChange={(v) => patch("status", v)}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Verification tier</Label>
            <Select value={project.verification} onValueChange={(v) => patch("verification", v)}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{TIERS.map((s) => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Trust score</Label>
            <Input type="number" value={project.trust_score} onChange={(e) => patch("trust_score", Number(e.target.value))} className="h-9 text-xs" />
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!project.x_verified} onChange={(e) => patch("x_verified", e.target.checked)} />
            X account verified
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!project.telegram_bot_added} onChange={(e) => patch("telegram_bot_added", e.target.checked)} />
            Telegram bot added
          </label>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-xs font-medium text-foreground flex items-center gap-1.5 mb-2">
          <Users className="w-3.5 h-3.5" /> Workspace access
        </p>
        {members.length === 0 ? (
          <p className="text-[11px] text-muted-foreground mb-2">No one can open this workspace yet.</p>
        ) : (
          <ul className="space-y-1.5 mb-3">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-foreground">{m.email}</span>
                <span className="text-[11px] text-muted-foreground capitalize">{m.member_role}{m.user_id ? "" : " · not signed up yet"}</span>
                <button onClick={() => removeMember(m.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <Input value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="person@project.xyz" className="h-9 text-xs flex-1" />
          <Select value={newMemberRole} onValueChange={setNewMemberRole}>
            <SelectTrigger className="h-9 w-[130px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["owner", "project_admin", "manager", "member"].map((r) => (
                <SelectItem key={r} value={r} className="text-xs capitalize">{r.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={addMember} className="h-9"><Plus className="w-3.5 h-3.5" /></Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-xs font-medium text-foreground mb-2">Recent contributions to this project</p>
        {contributions.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">Nothing tracked for this project yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {contributions.map((c) => (
              <li key={c.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <a href={c.post_url} target="_blank" rel="noreferrer" className="text-primary truncate block max-w-[380px]">{c.post_url}</a>
                  <span className="text-[11px] text-muted-foreground">{c.user_email} · {new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <span className="text-[11px] text-muted-foreground capitalize shrink-0">
                  {c.status}{(c.manual_score ?? c.ai_score) != null ? ` · score ${c.manual_score ?? c.ai_score}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
          onClick={() => setConfirm({
            open: true,
            title: `Delete ${project.name}?`,
            desc: "This removes the workspace and its members. Contribution data is kept.",
            fn: async () => {
              await supabase.from("project_members" as any).delete().eq("project_id", project.id);
              await supabase.from("projects" as any).delete().eq("id", project.id);
              toast({ title: "Project deleted" });
              navigate("/admin/manage-projects");
            },
          })}
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete project
        </Button>
      </div>

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(o: boolean) => setConfirm((c) => ({ ...c, open: o }))}
        title={confirm.title}
        description={confirm.desc}
        onConfirm={confirm.fn}
      />
    </div>
  );
};

export default AdminProjectDetail;
