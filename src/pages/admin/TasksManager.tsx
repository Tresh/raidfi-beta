import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Task {
  id: string;
  task_type: string;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
}

const TasksManager = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("waitlist_tasks")
      .select("*")
      .order("sort_order", { ascending: true });
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
    const { error } = await supabase
      .from("waitlist_tasks")
      .insert({
        task_type: "custom",
        label: "New Task",
        url: "https://example.com",
        sort_order: tasks.length + 1,
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
        <Button onClick={handleAdd} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add Task
        </Button>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_80px_auto] gap-3 items-end">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Label</label>
                  <Input
                    value={task.label}
                    onChange={(e) => updateField(task.id, "label", e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">URL</label>
                  <Input
                    value={task.url}
                    onChange={(e) => updateField(task.id, "url", e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Order</label>
                  <Input
                    type="number"
                    value={task.sort_order}
                    onChange={(e) => updateField(task.id, "sort_order", parseInt(e.target.value) || 0)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={task.is_active}
                    onCheckedChange={(v) => updateField(task.id, "is_active", v)}
                  />
                  <Button size="sm" variant="outline" onClick={() => handleUpdate(task)} disabled={saving === task.id}>
                    {saving === task.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(task.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xs text-muted-foreground">Type: {task.task_type}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TasksManager;
