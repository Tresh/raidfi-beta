import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Save, Pin, PinOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

interface ContributeTask {
  id: string;
  label: string;
  description: string | null;
  points: number;
  task_type: string;
  url: string | null;
  sort_order: number;
  is_active: boolean;
  is_pinned: boolean;
  requires_link_submission: boolean;
  submission_label: string | null;
  submission_placeholder: string | null;
  action_types: string[];
  telegram_notified?: boolean;
  created_at?: string;
}

const TASK_TYPES = [
  { value: "link", label: "Link" },
  { value: "form", label: "Form" },
  { value: "custom", label: "Custom" },
];

const ContributeTasksManager = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<ContributeTask[]>([]);
  const [actionTypes, setActionTypes] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: t }, { data: at }] = await Promise.all([
      supabase.from("contribute_tasks" as any).select("*"),
      supabase.from("task_action_types" as any).select("value,label").eq("is_active", true).order("sort_order"),
    ]);
    // Sort: pinned first, then newest first
    const sorted = ((t as any) || []).sort((a: any, b: any) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
    setTasks(sorted);
    setActionTypes((at as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleUpdate = async (task: ContributeTask) => {
    setSaving(task.id);
    const shouldNotify = task.is_active && !task.telegram_notified;
    const { error } = await supabase.from("contribute_tasks" as any).update({
      label: task.label, description: task.description, points: task.points,
      task_type: task.task_type, url: task.url, sort_order: task.sort_order,
      is_active: task.is_active, is_pinned: task.is_pinned,
      requires_link_submission: task.requires_link_submission,
      submission_label: task.submission_label, submission_placeholder: task.submission_placeholder,
      action_types: task.action_types,
      ...(shouldNotify ? { telegram_notified: true } : {}),
    } as any).eq("id", task.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved" });
      if (shouldNotify) {
        const actions = (task.action_types || []).length
          ? `\n<b>Actions:</b> ${task.action_types.join(", ")}` : "";
        const desc = task.description ? `\n\n${task.description}` : "";
        const url = task.url ? `\n\n🔗 ${task.url}` : "";
        const text = `🆕 <b>New Contributor Task</b>\n\n<b>${task.label}</b>${desc}${actions}\n\n+${task.points} XP${url}`;
        supabase.functions.invoke("notify-telegram", {
          body: {
            kind: "task",
            text,
            link: `${window.location.origin}/contributions`,
            buttonText: "Do task",
          },
        }).catch(console.error);
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, telegram_notified: true } : t));
      }
    }
    setSaving(null);
  };

  const handleAdd = async () => {
    const { error } = await supabase.from("contribute_tasks" as any).insert({
      label: "New Task", description: "", points: 10, task_type: "link", url: "",
      sort_order: tasks.length + 1, action_types: [],
    } as any);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    fetchAll();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("contribute_tasks" as any).delete().eq("id", deleteTarget.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setTasks(prev => prev.filter(t => t.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const updateField = (id: string, field: keyof ContributeTask, value: any) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const toggleActionType = (id: string, value: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const current = t.action_types || [];
      return { ...t, action_types: current.includes(value) ? current.filter(v => v !== value) : [...current, value] };
    }));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contribute Tasks</h1>
          <p className="text-sm text-muted-foreground">Manage tasks shown on the Contributions page. Pinned tasks always appear first.</p>
        </div>
        <Button onClick={handleAdd} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Task</Button>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className={task.is_pinned ? "border-primary/50" : ""}>
            <CardContent className="p-4 space-y-3">
              {task.is_pinned && (
                <div className="flex items-center gap-1.5 text-[11px] text-primary font-medium">
                  <Pin className="w-3 h-3" /> Pinned to top
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Label</label>
                  <Input value={task.label} onChange={(e) => updateField(task.id, "label", e.target.value)} className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                  <Input value={task.description || ""} onChange={(e) => updateField(task.id, "description", e.target.value)} className="h-9 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Points</label>
                  <Input type="number" value={task.points} onChange={(e) => updateField(task.id, "points", parseInt(e.target.value) || 0)} className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                  <select value={task.task_type} onChange={(e) => updateField(task.id, "task_type", e.target.value)}
                    className="w-full h-9 text-sm rounded-md border border-input bg-background px-3 text-foreground">
                    {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">URL</label>
                  <Input value={task.url || ""} onChange={(e) => updateField(task.id, "url", e.target.value)} className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Order</label>
                  <Input type="number" value={task.sort_order} onChange={(e) => updateField(task.id, "sort_order", parseInt(e.target.value) || 0)} className="h-9 text-sm" />
                </div>
              </div>

              {/* Action types multi-select */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Action types (multi-select)</label>
                <div className="flex flex-wrap gap-1.5">
                  {actionTypes.map(at => {
                    const selected = (task.action_types || []).includes(at.value);
                    return (
                      <button key={at.value} type="button" onClick={() => toggleActionType(task.id, at.value)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}>
                        {at.label}
                      </button>
                    );
                  })}
                  {actionTypes.length === 0 && <span className="text-xs text-muted-foreground">Add types in Settings</span>}
                </div>
              </div>

              {/* Link submission */}
              <div className="space-y-2 p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">Require link submission</p>
                    <p className="text-[11px] text-muted-foreground">User must paste a link to complete this task.</p>
                  </div>
                  <Switch checked={task.requires_link_submission}
                    onCheckedChange={(v) => updateField(task.id, "requires_link_submission", v)} />
                </div>
                {task.requires_link_submission && (
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={task.submission_label || ""} placeholder="Field label (e.g. Tweet URL)"
                      onChange={(e) => updateField(task.id, "submission_label", e.target.value)} className="h-8 text-xs" />
                    <Input value={task.submission_placeholder || ""} placeholder="Placeholder (e.g. https://x.com/...)"
                      onChange={(e) => updateField(task.id, "submission_placeholder", e.target.value)} className="h-8 text-xs" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch checked={task.is_active} onCheckedChange={(v) => updateField(task.id, "is_active", v)} />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch checked={task.is_pinned} onCheckedChange={(v) => updateField(task.id, "is_pinned", v)} />
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {task.is_pinned ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />} Pinned
                    </span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleUpdate(task)} disabled={saving === task.id}>
                    {saving === task.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />} Save
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive"
                    onClick={() => { setDeleteTarget({ id: task.id, label: task.label }); setConfirmOpen(true); }}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Task"
        description={`Permanently delete "${deleteTarget?.label || ""}"? Cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ContributeTasksManager;
