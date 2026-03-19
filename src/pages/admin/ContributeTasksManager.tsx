import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContributeTask {
  id: string;
  label: string;
  description: string | null;
  points: number;
  task_type: string;
  url: string | null;
  sort_order: number;
  is_active: boolean;
}

const TASK_TYPES = [
  { value: "link", label: "Link" },
  { value: "form", label: "Form" },
  { value: "custom", label: "Custom" },
];

const ContributeTasksManager = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<ContributeTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contribute_tasks" as any)
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setTasks(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleUpdate = async (task: ContributeTask) => {
    setSaving(task.id);
    const { error } = await supabase
      .from("contribute_tasks" as any)
      .update({
        label: task.label,
        description: task.description,
        points: task.points,
        task_type: task.task_type,
        url: task.url,
        sort_order: task.sort_order,
        is_active: task.is_active,
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
    const { error } = await supabase.from("contribute_tasks" as any).insert({
      label: "New Task",
      description: "",
      points: 10,
      task_type: "link",
      url: "",
      sort_order: tasks.length + 1,
    } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      fetchTasks();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("contribute_tasks" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const updateField = (id: string, field: keyof ContributeTask, value: any) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contribute Tasks</h1>
          <p className="text-sm text-muted-foreground">Manage tasks shown on the Contributions page for users to earn points.</p>
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

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Switch checked={task.is_active} onCheckedChange={(v) => updateField(task.id, "is_active", v)} />
                  <span className="text-xs text-muted-foreground">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleUpdate(task)} disabled={saving === task.id}>
                    {saving === task.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(task.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContributeTasksManager;
