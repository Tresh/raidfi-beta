import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save, Plus, Trash2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

interface Settings {
  id: string;
  auto_publish_contributions: boolean;
  telegram_enabled: boolean;
  telegram_chat_id: string | null;
  telegram_notify_feed: boolean;
  telegram_notify_tasks: boolean;
  scoring_delay_hours: number;
}

const DEFAULT_SETTINGS: Settings = {
  id: "global",
  auto_publish_contributions: false,
  telegram_enabled: false,
  telegram_chat_id: null,
  telegram_notify_feed: false,
  telegram_notify_tasks: false,
  scoring_delay_hours: 24,
};

interface TypeRow {
  id: string;
  value: string;
  label: string;
  default_points?: number;
  is_active: boolean;
  sort_order: number;
}

const SettingsManager = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [contentTypes, setContentTypes] = useState<TypeRow[]>([]);
  const [actionTypes, setActionTypes] = useState<TypeRow[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ title: string; desc: string; fn: () => void }>({
    title: "", desc: "", fn: () => {},
  });
  const [testingTg, setTestingTg] = useState(false);

  const askConfirm = (title: string, desc: string, fn: () => void) => {
    setConfirmAction({ title, desc, fn });
    setConfirmOpen(true);
  };

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: s }, { data: ct }, { data: at }] = await Promise.all([
      supabase.from("admin_settings" as any).select("*").eq("id", "global").maybeSingle(),
      supabase.from("content_types" as any).select("*").order("sort_order"),
      supabase.from("task_action_types" as any).select("*").order("sort_order"),
    ]);
    setSettings((s as any) || DEFAULT_SETTINGS);
    setContentTypes((ct as any) || []);
    setActionTypes((at as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const saveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    const { error } = await supabase
      .from("admin_settings" as any)
      .upsert({
        id: "global",
        auto_publish_contributions: settings.auto_publish_contributions,
        telegram_enabled: settings.telegram_enabled,
        telegram_chat_id: settings.telegram_chat_id?.trim() || null,
        telegram_notify_feed: settings.telegram_notify_feed,
        telegram_notify_tasks: settings.telegram_notify_tasks,
        scoring_delay_hours: settings.scoring_delay_hours,
        updated_at: new Date().toISOString(),
      } as any, { onConflict: "id" });
    setSavingSettings(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Saved" });
  };

  const testTelegram = async () => {
    setTestingTg(true);
    const { data, error } = await supabase.functions.invoke("notify-telegram", {
      body: { kind: "test", text: "✅ <b>RaidFi</b> Telegram connection works!" },
    });
    setTestingTg(false);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else if ((data as any)?.skipped) toast({ title: "Skipped", description: (data as any).skipped, variant: "destructive" });
    else toast({ title: "Sent ✓", description: "Check your Telegram channel." });
  };

  const addType = async (table: "content_types" | "task_action_types", existing: TypeRow[]) => {
    const value = prompt("New value (lowercase, no spaces, e.g. 'thread'):");
    if (!value) return;
    const label = prompt("Display label:") || value;
    const { error } = await supabase.from(table as any).insert({
      value: value.toLowerCase().trim(),
      label: label.trim(),
      sort_order: existing.length + 1,
      ...(table === "content_types" ? { default_points: 10 } : {}),
    } as any);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchAll();
  };

  const updateType = async (table: "content_types" | "task_action_types", row: TypeRow) => {
    const payload: any = {
      label: row.label,
      is_active: row.is_active,
      sort_order: row.sort_order,
    };
    if (table === "content_types") payload.default_points = row.default_points;
    const { error } = await supabase.from(table as any).update(payload).eq("id", row.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Saved" });
  };

  const deleteType = async (table: "content_types" | "task_action_types", id: string) => {
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchAll();
  };

  if (loading || !settings) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Global controls for contributions, feed, and integrations.</p>
      </div>

      {/* Contributions */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Contributions</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Auto-publish new contributions to feed</p>
              <p className="text-xs text-muted-foreground">New posts appear instantly with an "Awaiting score" badge.</p>
            </div>
            <Switch checked={settings.auto_publish_contributions}
              onCheckedChange={(v) => setSettings({ ...settings, auto_publish_contributions: v })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Scoring delay notice (hours)</label>
            <Input type="number" className="h-9 max-w-[160px]" value={settings.scoring_delay_hours}
              onChange={(e) => setSettings({ ...settings, scoring_delay_hours: parseInt(e.target.value) || 0 })} />
            <p className="text-[11px] text-muted-foreground mt-1">Shown to users: "Posts are scored within X hours."</p>
          </div>
        </CardContent>
      </Card>

      {/* Telegram */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Telegram</h2>
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground">Enable Telegram notifications</p>
            <Switch checked={settings.telegram_enabled}
              onCheckedChange={(v) => setSettings({ ...settings, telegram_enabled: v })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Telegram channel/chat ID</label>
            <Input className="h-9" placeholder="-100xxxxxxxxxx or @yourchannel"
              value={settings.telegram_chat_id || ""}
              onChange={(e) => setSettings({ ...settings, telegram_chat_id: e.target.value })} />
            <p className="text-[11px] text-muted-foreground mt-1">
              Add your bot to the channel as admin. Use the channel's numeric ID (e.g. -1001234567890) or @username.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center justify-between p-3 rounded-lg border border-border">
              <span className="text-sm text-foreground">New feed posts</span>
              <Switch checked={settings.telegram_notify_feed}
                onCheckedChange={(v) => setSettings({ ...settings, telegram_notify_feed: v })} />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg border border-border">
              <span className="text-sm text-foreground">New tasks</span>
              <Switch checked={settings.telegram_notify_tasks}
                onCheckedChange={(v) => setSettings({ ...settings, telegram_notify_tasks: v })} />
            </label>
          </div>
          <Button variant="outline" size="sm" onClick={testTelegram} disabled={testingTg || !settings.telegram_enabled}>
            {testingTg ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Send test message
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => askConfirm("Save settings", "Apply these changes globally?", saveSettings)} disabled={savingSettings}>
          {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save settings
        </Button>
      </div>

      {/* Content types */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Contribution content types</h2>
              <p className="text-xs text-muted-foreground">Types users can pick when submitting (post, quote, space, ...)</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => addType("content_types", contentTypes)}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {contentTypes.map((t) => (
              <div key={t.id} className="grid grid-cols-[1fr_1fr_90px_90px_auto_auto] gap-2 items-center">
                <Input className="h-8 text-xs" value={t.value} disabled />
                <Input className="h-8 text-xs" value={t.label}
                  onChange={(e) => setContentTypes(prev => prev.map(x => x.id === t.id ? { ...x, label: e.target.value } : x))} />
                <Input type="number" className="h-8 text-xs" value={t.default_points || 0}
                  onChange={(e) => setContentTypes(prev => prev.map(x => x.id === t.id ? { ...x, default_points: parseInt(e.target.value) || 0 } : x))} />
                <Input type="number" className="h-8 text-xs" value={t.sort_order}
                  onChange={(e) => setContentTypes(prev => prev.map(x => x.id === t.id ? { ...x, sort_order: parseInt(e.target.value) || 0 } : x))} />
                <Switch checked={t.is_active}
                  onCheckedChange={(v) => setContentTypes(prev => prev.map(x => x.id === t.id ? { ...x, is_active: v } : x))} />
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => updateType("content_types", t)}><Save className="w-3 h-3" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive"
                    onClick={() => askConfirm("Delete content type", `Delete "${t.label}"?`, () => deleteType("content_types", t.id))}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground">Columns: value · label · default points · sort order · active</p>
          </div>
        </CardContent>
      </Card>

      {/* Action types */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Task action types</h2>
              <p className="text-xs text-muted-foreground">Used as multi-select tags on Contribute tasks (like, comment, repost, ...).</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => addType("task_action_types", actionTypes)}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {actionTypes.map((t) => (
              <div key={t.id} className="grid grid-cols-[1fr_1fr_90px_auto_auto] gap-2 items-center">
                <Input className="h-8 text-xs" value={t.value} disabled />
                <Input className="h-8 text-xs" value={t.label}
                  onChange={(e) => setActionTypes(prev => prev.map(x => x.id === t.id ? { ...x, label: e.target.value } : x))} />
                <Input type="number" className="h-8 text-xs" value={t.sort_order}
                  onChange={(e) => setActionTypes(prev => prev.map(x => x.id === t.id ? { ...x, sort_order: parseInt(e.target.value) || 0 } : x))} />
                <Switch checked={t.is_active}
                  onCheckedChange={(v) => setActionTypes(prev => prev.map(x => x.id === t.id ? { ...x, is_active: v } : x))} />
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => updateType("task_action_types", t)}><Save className="w-3 h-3" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive"
                    onClick={() => askConfirm("Delete action type", `Delete "${t.label}"?`, () => deleteType("task_action_types", t.id))}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction.title}
        description={confirmAction.desc}
        confirmLabel="Confirm"
        variant="default"
        onConfirm={confirmAction.fn}
      />
    </div>
  );
};

export default SettingsManager;
