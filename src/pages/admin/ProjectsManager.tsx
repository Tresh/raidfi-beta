import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, ExternalLink, Search, Users, Save, Trash2, ShieldCheck, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader, StatCard } from "@/components/dashboard/Primitives";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

interface ProjectRow {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  x_handle: string | null;
  telegram: string | null;
  discord: string | null;
  founder_name: string | null;
  contact_email: string;
  description: string | null;
  verification: string;
  status: string;
  trust_score: number;
  is_private?: boolean;
  telegram_group_id: string | null;
  telegram_bot_added: boolean;
  x_verified: boolean;
  created_at: string;
}

interface MemberRow {
  id: string;
  project_id: string;
  email: string;
  member_role: string;
  user_id: string | null;
}

const STATUSES = ["active", "paused", "archived"];
const TIERS = ["unverified", "basic", "verified", "partner"];

const ProjectsManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<ProjectRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("manager");
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; desc: string; fn: () => void }>({
    open: false, title: "", desc: "", fn: () => {},
  });

  const load = async () => {
    setLoading(true);
    const [{ data: p }, { data: m }] = await Promise.all([
      supabase.from("projects" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("project_members" as any).select("id,project_id,email,member_role,user_id"),
    ]);
    setRows(((p as any) ?? []) as ProjectRow[]);
    setMembers(((m as any) ?? []) as MemberRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!term) return true;
      return [r.name, r.slug, r.contact_email, r.x_handle, r.founder_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [rows, q, statusFilter]);

  const memberCount = (id: string) => members.filter((m) => m.project_id === id).length;
  const editingMembers = editing ? members.filter((m) => m.project_id === editing.id) : [];

  const patch = (field: keyof ProjectRow, value: unknown) =>
    setEditing((prev) => (prev ? { ...prev, [field]: value } as ProjectRow : prev));

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase
      .from("projects" as any)
      .update({
        name: editing.name,
        slug: editing.slug,
        website: editing.website,
        x_handle: editing.x_handle,
        telegram: editing.telegram,
        discord: editing.discord,
        founder_name: editing.founder_name,
        contact_email: editing.contact_email,
        description: editing.description,
        verification: editing.verification,
        status: editing.status,
        trust_score: Number(editing.trust_score) || 0,
        is_private: !!editing.is_private,
        telegram_group_id: editing.telegram_group_id,
        telegram_bot_added: editing.telegram_bot_added,
        x_verified: editing.x_verified,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", editing.id);
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Project updated" });
    setEditing(null);
    load();
  };

  const addMember = async () => {
    if (!editing || !newMemberEmail.trim()) return;
    const email = newMemberEmail.trim().toLowerCase();
    const { error } = await supabase.from("project_members" as any).insert({
      project_id: editing.id,
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

  const removeMember = async (id: string) => {
    await supabase.from("project_members" as any).delete().eq("id", id);
    load();
  };

  const deleteProject = (row: ProjectRow) =>
    setConfirm({
      open: true,
      title: `Delete ${row.name}?`,
      desc: "This removes the workspace and its members. Contribution data is kept.",
      fn: async () => {
        await supabase.from("project_members" as any).delete().eq("project_id", row.id);
        await supabase.from("projects" as any).delete().eq("id", row.id);
        toast({ title: "Project deleted" });
        setEditing(null);
        load();
      },
    });

  return (
    <div>
      <PageHeader title="Manage Projects" subtitle="Every live project workspace, its access and its verification state." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Projects" value={rows.length} />
        <StatCard label="Active" value={rows.filter((r) => r.status === "active").length} accent />
        <StatCard label="X verified" value={rows.filter((r) => r.x_verified).length} />
        <StatCard label="Workspace seats" value={members.length} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, slug, email or handle" className="h-9 pl-9 text-xs" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[140px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Any status</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : list.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">No projects match that.</p>
      ) : (
        <div className="space-y-2.5">
          {list.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    {r.name}
                    {r.x_verified && <ShieldCheck className="w-3.5 h-3.5 text-primary" />}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    /{r.slug} · {r.contact_email} · {memberCount(r.id)} member{memberCount(r.id) === 1 ? "" : "s"} ·{" "}
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 capitalize">
                    {r.status} · {r.verification} · trust {r.trust_score}
                    {r.x_handle ? ` · @${r.x_handle.replace(/^@/, "")}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {r.website && (
                    <a href={r.website} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!r.is_private}
                      onChange={async (e) => {
                        const v = e.target.checked;
                        const { error } = await supabase.from("projects").update({ is_private: v } as any).eq("id", r.id);
                        if (!error) setRows((prev: any[]) => prev.map((x) => (x.id === r.id ? { ...x, is_private: v } : x)));
                      }}
                    />
                    Private
                  </label>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/manage-projects/${r.id}`)}>Manage</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-base">{editing?.name}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Name</Label>
                  <Input value={editing.name} onChange={(e) => patch("name", e.target.value)} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Slug</Label>
                  <Input value={editing.slug} onChange={(e) => patch("slug", e.target.value)} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Contact email</Label>
                  <Input value={editing.contact_email} onChange={(e) => patch("contact_email", e.target.value)} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Founder</Label>
                  <Input value={editing.founder_name ?? ""} onChange={(e) => patch("founder_name", e.target.value)} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Website</Label>
                  <Input value={editing.website ?? ""} onChange={(e) => patch("website", e.target.value)} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">X handle</Label>
                  <Input value={editing.x_handle ?? ""} onChange={(e) => patch("x_handle", e.target.value)} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Telegram</Label>
                  <Input value={editing.telegram ?? ""} onChange={(e) => patch("telegram", e.target.value)} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Telegram group ID</Label>
                  <Input value={editing.telegram_group_id ?? ""} onChange={(e) => patch("telegram_group_id", e.target.value)} className="h-9 text-xs" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea value={editing.description ?? ""} onChange={(e) => patch("description", e.target.value)} rows={3} className="text-xs" />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Status</Label>
                  <Select value={editing.status} onValueChange={(v) => patch("status", v)}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Verification tier</Label>
                  <Select value={editing.verification} onValueChange={(v) => patch("verification", v)}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{TIERS.map((s) => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Trust score</Label>
                  <Input type="number" value={editing.trust_score} onChange={(e) => patch("trust_score", Number(e.target.value))} className="h-9 text-xs" />
                </div>
                <label className="flex items-center gap-2 text-xs col-span-full">
                  <input type="checkbox" checked={!!editing.is_private} onChange={(e) => patch("is_private", e.target.checked)} />
                  Private partner (hidden from Explore and public pages)
                </label>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={editing.x_verified} onChange={(e) => patch("x_verified", e.target.checked)} />
                  X account verified
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={editing.telegram_bot_added} onChange={(e) => patch("telegram_bot_added", e.target.checked)} />
                  Telegram bot added
                </label>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-medium text-foreground flex items-center gap-1.5 mb-2">
                  <Users className="w-3.5 h-3.5" /> Workspace access
                </p>
                {editingMembers.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground mb-2">No one can open this workspace yet.</p>
                ) : (
                  <ul className="space-y-1.5 mb-3">
                    {editingMembers.map((m) => (
                      <li key={m.id} className="flex items-center justify-between gap-2 text-xs">
                        <span className="truncate text-foreground">{m.email}</span>
                        <span className="text-[11px] text-muted-foreground capitalize">{m.member_role}</span>
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
                    <SelectTrigger className="h-9 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["owner", "project_admin", "manager", "member"].map((r) => (
                        <SelectItem key={r} value={r} className="text-xs capitalize">{r.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={addMember} className="h-9">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => deleteProject(editing)} className="text-destructive">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete project
                </Button>
                <Button size="sm" onClick={save} disabled={saving}>
                  {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                  Save changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

export default ProjectsManager;
