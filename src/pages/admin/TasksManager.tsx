import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Save, Eye, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Task {
  id: string;
  task_type: string;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
  requires_input: boolean;
  input_label: string | null;
  input_placeholder: string | null;
  verification_type: string;
}

interface TaskSubmission {
  id: string;
  submission_email: string;
  task_id: string;
  clicked_at: string | null;
  verified_at: string | null;
  input_value: string | null;
  created_at: string;
}

const TASK_TYPES = [
  { value: "telegram", label: "Telegram" },
  { value: "x_follow", label: "X Follow" },
  { value: "x_comment", label: "X Comment" },
  { value: "custom", label: "Custom" },
  { value: "input", label: "Input" },
];

const VERIFICATION_TYPES = [
  { value: "manual", label: "Manual" },
  { value: "username", label: "Username" },
  { value: "link", label: "Link" },
];

const TasksManager = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await supabase.from("waitlist_tasks").select("*").order("sort_order", { ascending: true });
    if (data) setTasks(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleUpdate = async (task: Task) => {
    setSaving(task.id);
    const { error } = await supabase
      .from("waitlist_tasks")
      .update({
        label: task.label,
        url: task.url,
        sort_order: task.sort_order,
        is_active: task.is_active,
        task_type: task.task_type,
        requires_input: task.requires_input,
        input_label: task.input_label,
        input_placeholder: task.input_placeholder,
        verification_type: task.verification_type,
      } as any)
      .eq("id", task.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved" });
    }
    setSaving(null);
  };

  const handleAdd = async () => {
    const { error } = await supabase.from("waitlist_tasks").insert({
      task_type: "custom",
      label: "New Task",
      url: "https://example.com",
      sort_order: tasks.length + 1,
      requires_input: false,
      verification_type: "manual",
    } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      fetchTasks();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("waitlist_tasks").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const updateField = (id: string, field: keyof Task, value: any) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const viewSubmissions = async (taskId: string) => {
    setViewingTaskId(taskId);
    setLoadingSubs(true);
    const { data } = await supabase
      .from("waitlist_task_submissions" as any)
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setSubmissions(data as any);
    setLoadingSubs(false);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Waitlist Tasks</h1>
          <p className="text-sm text-muted-foreground">Manage tasks users must complete to join the waitlist.</p>
        </div>
        <Button onClick={handleAdd} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Task</Button>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Label</label>
                  <Input value={task.label} onChange={(e) => updateField(task.id, "label", e.target.value)} className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">URL</label>
                  <Input value={task.url} onChange={(e) => updateField(task.id, "url", e.target.value)} className="h-9 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                  <select value={task.task_type} onChange={(e) => updateField(task.id, "task_type", e.target.value)}
                    className="w-full h-9 text-sm rounded-md border border-input bg-background px-3 text-foreground">
                    {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Verify Type</label>
                  <select value={task.verification_type} onChange={(e) => updateField(task.id, "verification_type", e.target.value)}
                    className="w-full h-9 text-sm rounded-md border border-input bg-background px-3 text-foreground">
                    {VERIFICATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Order</label>
                  <Input type="number" value={task.sort_order} onChange={(e) => updateField(task.id, "sort_order", parseInt(e.target.value) || 0)} className="h-9 text-sm" />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Switch checked={task.is_active} onCheckedChange={(v) => updateField(task.id, "is_active", v)} />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                </div>
              </div>

              {/* Input settings */}
              <div className="flex items-center gap-3">
                <Switch checked={task.requires_input} onCheckedChange={(v) => updateField(task.id, "requires_input", v)} />
                <span className="text-xs text-muted-foreground">Requires Input</span>
              </div>

              {task.requires_input && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Input Label</label>
                    <Input value={task.input_label || ""} onChange={(e) => updateField(task.id, "input_label", e.target.value)} className="h-9 text-sm" placeholder="e.g. Telegram Username" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Input Placeholder</label>
                    <Input value={task.input_placeholder || ""} onChange={(e) => updateField(task.id, "input_placeholder", e.target.value)} className="h-9 text-sm" placeholder="e.g. @yourusername" />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => handleUpdate(task)} disabled={saving === task.id}>
                  {saving === task.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => viewSubmissions(task.id)}>
                  <Eye className="w-3 h-3 mr-1" /> Submissions
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(task.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submissions modal */}
      {viewingTaskId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setViewingTaskId(null)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Task Submissions</h2>
              <button onClick={() => setViewingTaskId(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            {loadingSubs ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : submissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No submissions yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-2 text-muted-foreground font-medium">Email</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Input</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Clicked</th>
                      <th className="text-left p-2 text-muted-foreground font-medium">Verified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map(s => (
                      <tr key={s.id} className="border-b border-border/30">
                        <td className="p-2 text-foreground">{s.submission_email}</td>
                        <td className="p-2 text-foreground">{s.input_value || "—"}</td>
                        <td className="p-2 text-muted-foreground text-xs">{s.clicked_at ? new Date(s.clicked_at).toLocaleString() : "—"}</td>
                        <td className="p-2 text-muted-foreground text-xs">{s.verified_at ? new Date(s.verified_at).toLocaleString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksManager;
