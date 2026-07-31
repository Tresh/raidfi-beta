import { useState } from "react";
import ProjectLayout from "@/components/project/ProjectLayout";
import { PageHeader, Panel } from "@/components/dashboard/Primitives";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProjectCampaigns = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [minXp, setMinXp] = useState("250");
  const [budget, setBudget] = useState("");
  const [brief, setBrief] = useState("");
  const [copied, setCopied] = useState(false);

  const draft = [
    `Campaign: ${title || "Untitled campaign"}`,
    `Goal: ${goal || "—"}`,
    `Audience: ${audience || "—"}`,
    `Minimum contributor reputation: ${minXp || "0"} XP`,
    `Reward pool: ${budget || "—"}`,
    "",
    brief || "Brief: describe the narrative, key links and what a great contribution looks like.",
  ].join("\n");

  const copy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    toast({ title: "Draft copied", description: "Paste it into your campaign request to the RaidFi team." });
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <ProjectLayout>
      <PageHeader
        title="Campaigns"
        subtitle="Draft a campaign brief now — automated distribution and payouts land in a later release."
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Campaign brief" description="Everything RaidFi needs to route the right contributors.">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-title">Title</Label>
              <Input id="c-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mainnet launch push" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-goal">Goal</Label>
              <Input id="c-goal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Awareness, testnet signups, app installs…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="c-aud">Audience</Label>
                <Input id="c-aud" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="DeFi natives" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-xp">Min reputation (XP)</Label>
                <Input id="c-xp" type="number" value={minXp} onChange={(e) => setMinXp(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-budget">Reward pool</Label>
              <Input id="c-budget" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. $2,000 or 10,000 tokens" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-brief">Narrative & requirements</Label>
              <Textarea id="c-brief" rows={6} value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Key messages, links, hashtags, do's and don'ts" />
            </div>
          </div>
        </Panel>

        <Panel
          title="Preview"
          description="Copy this draft and share it with the RaidFi team to launch."
          action={
            <Button size="sm" variant="outline" onClick={copy}>
              {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}Copy
            </Button>
          }
        >
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans">{draft}</pre>
        </Panel>
      </div>
    </ProjectLayout>
  );
};

export default ProjectCampaigns;
