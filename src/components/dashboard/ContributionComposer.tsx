import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Send } from "lucide-react";

const TWEET_URL_REGEX = /^https?:\/\/(x\.com|twitter\.com)\/[^/]+\/status\/(\d+)/;

export const ContributionComposer = ({ onSubmitted }: { onSubmitted?: () => void }) => {
  const { session } = useAuth();
  const { toast } = useToast();

  const [postUrl, setPostUrl] = useState("");
  const [contentType, setContentType] = useState("post");
  const [mediaType, setMediaType] = useState<"text" | "image">("text");
  const [aiGenerated, setAiGenerated] = useState(false);
  const [projectId, setProjectId] = useState<string>("");
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [types, setTypes] = useState<{ value: string; label: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from("content_types")
      .select("value,label")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setTypes((data as any) ?? []));

    supabase
      .from("projects" as any)
      .select("id,name")
      .eq("status", "active")
      .order("name")
      .then(({ data }) => setProjects((data as any) ?? []));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) return;
    if (!TWEET_URL_REGEX.test(postUrl.trim())) {
      toast({ title: "Invalid link", description: "Paste a full X post URL.", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    const { data, error } = await supabase.functions.invoke("submit-contribution", {
      body: {
        post_url: postUrl.trim(),
        content_type: contentType,
        media_type: mediaType,
        ai_generated: aiGenerated,
        project_id: projectId || null,
        origin: window.location.origin,
      },
    });


    let message: string | null = null;
    if (error) {
      let detail = "";
      try {
        detail = (await (error as any)?.context?.text?.()) ?? "";
      } catch {
        detail = "";
      }
      try {
        message = detail ? (JSON.parse(detail).error as string) : null;
      } catch {
        message = detail || null;
      }
      message = message || "We couldn't submit that post right now. Please try again.";
    } else if ((data as any)?.error) {
      message = (data as any).error;
    }

    setSubmitting(false);
    if (message) {
      toast({ title: "Post not accepted", description: message, variant: "destructive" });
      return;
    }

    setPostUrl("");
    setAiGenerated(false);
    setMediaType("text");
    toast({ title: "Contribution tracked", description: "It will be scored after review." });
    onSubmitted?.();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label htmlFor="post-url-input" className="text-xs font-medium text-foreground mb-1 block">
          X Post URL <span className="text-destructive">*</span>
        </label>
        <Input
          id="post-url-input"
          placeholder="https://x.com/user/status/..."
          value={postUrl}
          onChange={(e) => setPostUrl(e.target.value)}
          className="h-10 text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="project-select" className="text-xs font-medium text-foreground mb-1 block">
          Target Project
        </label>
        <select
          id="project-select"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">No specific project (RaidFi general)</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <p className="text-[11px] text-muted-foreground mt-1">
          Pick the project this contribution supports so it shows in their workspace.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="content-type-select" className="text-xs font-medium text-foreground mb-1 block">
            Content Type
          </label>
          <select
            id="content-type-select"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {(types.length ? types : [{ value: "post", label: "Post" }]).map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="media-type-select" className="text-xs font-medium text-foreground mb-1 block">
            Media Format
          </label>
          <select
            id="media-type-select"
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as "text" | "image")}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="text">Text</option>
            <option value="image">Image / visual</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
        <label htmlFor="ai-switch" className="cursor-pointer">
          <p className="text-xs font-medium text-foreground">Created with AI</p>
          <p className="text-[11px] text-muted-foreground">Be transparent - it doesn't reduce your score.</p>
        </label>
        <Switch id="ai-switch" aria-label="Created with AI" checked={aiGenerated} onCheckedChange={setAiGenerated} />
      </div>

      <Button type="submit" className="w-full h-10 text-sm" disabled={submitting}>
        {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
        Submit
      </Button>
      <p className="text-[11px] text-muted-foreground">
        Only posts from your verified X account are accepted. Submissions are reviewed before they affect
        reputation.
      </p>
    </form>
  );
};

export default ContributionComposer;
