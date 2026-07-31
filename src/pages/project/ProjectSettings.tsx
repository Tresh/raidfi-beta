import { useEffect, useState } from "react";
import ProjectLayout from "@/components/project/ProjectLayout";
import { PageHeader, Panel } from "@/components/dashboard/Primitives";
import { useProject } from "@/hooks/useProject";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProjectSettings = () => {
  const { project, role, email } = useProject();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!project) return;
    setName(project.name ?? "");
    setWebsite(project.website ?? "");
    setXHandle(project.x_handle ?? "");
    setDescription(project.description ?? "");
  }, [project]);

  const canEdit = role === "owner" || role === "manager";

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
