import { useEffect, useState } from "react";
import ProjectLayout from "@/components/project/ProjectLayout";
import { PageHeader, Panel } from "@/components/dashboard/Primitives";
import { useProject } from "@/hooks/useProject";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProjectSettings = () => {
  const { project, role, email } = useProject();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const [telegram, setTelegram] = useState("");
  const [groupId, setGroupId] = useState("");
  const [botAdded, setBotAdded] = useState(false);
  const [savingTg, setSavingTg] = useState(false);

  const [xVerified, setXVerified] = useState(false);
  const [xClaim, setXClaim] = useState("");
  const [xPostUrl, setXPostUrl] = useState("");
  const [verifyingX, setVerifyingX] = useState(false);
  const challenge = `raidfi-${(project?.slug ?? "").toLowerCase()}`;
  const postText = `We're done guessing who actually shows up for ${project?.name ?? "us"}.

We're now on @RaidFi — contribution tracking and reputation for our community. Real contribution, measured over time. Not likes. Not follower counts.

If you build with us, your record follows you.

${challenge}`;


  useEffect(() => {
    if (!project) return;
    setName(project.name ?? "");
    setWebsite(project.website ?? "");
    setXHandle(project.x_handle ?? "");
    setDescription(project.description ?? "");
    setTelegram(project.telegram ?? "");
    setGroupId(project.telegram_group_id ?? "");
    setBotAdded(Boolean(project.telegram_bot_added));
    setXVerified(Boolean(project.x_verified));
    setXClaim(project.x_handle ?? "");
  }, [project]);

  const canEdit = role === "owner" || role === "manager" || role === "project_admin";

  const verifyX = async () => {
    if (!project) return;
    setVerifyingX(true);
    const { data, error } = await supabase.functions.invoke("verify-project-x", {
      body: { project_id: project.id, handle: xClaim.trim(), post_url: xPostUrl.trim() },
    });
    setVerifyingX(false);
    let message: string | null = (data as any)?.error ?? null;
    if (!message && error) {
      try {
        const body = await (error as any).context?.json?.();
        message = body?.error ?? null;
      } catch { /* ignore */ }
      message = message ?? "We couldn't verify that post. Check the link and try again.";
    }

    if (message) {
      toast({ title: "Couldn't verify", description: message, variant: "destructive" });
      return;
    }
    setXVerified(true);
    setXHandle(xClaim.trim().replace(/^@/, ""));
    setXPostUrl("");
    toast({ title: "X account verified", description: `@${xClaim.trim().replace(/^@/, "")} is now linked to your project.` });
  };


  const save = async () => {
    if (!project) return;
    setSaving(true);
    const { error } = await supabase
      .from("projects" as any)
      .update({
        name: name.trim(),
        website: website.trim() || null,
        x_handle: xHandle.trim().replace(/^@/, "") || null,
        description: description.trim() || null,
      })
      .eq("id", project.id);
    setSaving(false);
    if (error) {
      toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Saved", description: "Project profile updated." });
  };

  const saveTelegram = async () => {
    if (!project) return;
    setSavingTg(true);
    const { error } = await supabase
      .from("projects" as any)
      .update({
        telegram: telegram.trim() || null,
        telegram_group_id: groupId.trim() || null,
        telegram_bot_added: botAdded,
      })
      .eq("id", project.id);
    setSavingTg(false);
    if (error) {
      toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Telegram settings saved", description: "Alerts will use this group." });
  };


  return (
    <ProjectLayout>
      <PageHeader title="Project settings" subtitle="Manage how your project appears to contributors." />

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Project profile">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-name">Name</Label>
              <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} disabled={!canEdit} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-site">Website</Label>
              <Input id="p-site" value={website} onChange={(e) => setWebsite(e.target.value)} disabled={!canEdit} placeholder="https://" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-x">X handle</Label>
              <Input id="p-x" value={xHandle} onChange={(e) => setXHandle(e.target.value)} disabled={!canEdit} placeholder="@project" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-desc">Description</Label>
              <Textarea id="p-desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} disabled={!canEdit} />
            </div>
            {canEdit && (
              <Button onClick={save} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save changes
              </Button>
            )}
          </div>
        </Panel>

        <Panel title="Telegram community" description="Send contribution alerts straight into your own group.">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-tg">Group invite link</Label>
              <Input id="p-tg" value={telegram} onChange={(e) => setTelegram(e.target.value)} disabled={!canEdit} placeholder="t.me/yourcommunity" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-tgid">Telegram group ID</Label>
              <Input id="p-tgid" value={groupId} onChange={(e) => setGroupId(e.target.value)} disabled={!canEdit} placeholder="-1001234567890" />
              <p className="text-[11px] text-muted-foreground">
                Add <a className="text-primary" href="https://t.me/raidficontributionbot" target="_blank" rel="noreferrer">@raidficontributionbot</a>{" "}
                to your group as an admin, then paste the group ID here to receive contribution and task alerts.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div>
                <p className="text-xs font-medium text-foreground">RaidFi bot added to the group</p>
                <p className="text-[11px] text-muted-foreground">Turn on once the bot is an admin in your group.</p>
              </div>
              <Switch checked={botAdded} onCheckedChange={setBotAdded} disabled={!canEdit} />
            </div>
            {canEdit && (
              <Button onClick={saveTelegram} disabled={savingTg} variant="outline">
                {savingTg && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save Telegram settings
              </Button>
            )}
          </div>
        </Panel>

        <Panel title="X account" description="Verify the official X account for this project.">
          {xVerified ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground">@{(project?.x_handle ?? "").replace(/^@/, "")} verified</p>
                  <p className="text-[11px] text-muted-foreground">Mentions from this account are attributed to your project.</p>
                </div>
              </div>
              {canEdit && (
                <Button variant="outline" size="sm" onClick={() => setXVerified(false)}>
                  Connect a different account
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="p-xh">X username</Label>
                <Input
                  id="p-xh"
                  value={xClaim}
                  onChange={(e) => setXClaim(e.target.value)}
                  disabled={!canEdit}
                  placeholder="@yourproject"
                />
              </div>
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2.5 space-y-1.5">
                <p className="text-[11px] text-muted-foreground">
                  Post this exact code from that account, then paste the post link below:
                </p>
                <code className="block text-xs font-mono text-foreground break-all">{challenge}</code>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-xp">Verification post link</Label>
                <Input
                  id="p-xp"
                  value={xPostUrl}
                  onChange={(e) => setXPostUrl(e.target.value)}
                  disabled={!canEdit}
                  placeholder="https://x.com/yourproject/status/..."
                />
              </div>
              {canEdit && (
                <Button onClick={verifyX} disabled={verifyingX || !xClaim.trim() || !xPostUrl.trim()} variant="outline">
                  {verifyingX && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Verify X account
                </Button>
              )}
            </div>
          )}
        </Panel>


        <Panel title="Workspace" description="Access and verification status.">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Signed in as</dt>
              <dd className="text-foreground truncate">{email}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Your role</dt>
              <dd className="text-foreground capitalize">{role ?? "member"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Verification tier</dt>
              <dd className="text-foreground capitalize">{project?.verification_tier ?? "unverified"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Trust score</dt>
              <dd className="text-foreground tabular-nums">{project?.trust_score ?? 0}</dd>
            </div>
          </dl>
          <p className="text-[11px] text-muted-foreground mt-4">
            Need more seats or a higher verification tier? Reach out to the RaidFi team and we'll upgrade your workspace.
          </p>
        </Panel>

      </div>
    </ProjectLayout>
  );
};

export default ProjectSettings;
