import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { AlertTriangle, Link2, Loader2, Send, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const TWEET_URL_REGEX = /^https?:\/\/(x\.com|twitter\.com)\/[^/]+\/status\/(\d+)/;

type MediaType = "text" | "image";

type FunctionErrorContext = {
  text?: () => Promise<string>;
};

const DEFAULT_TYPES = [
  { value: "post", label: "Post" },
  { value: "quote", label: "Quote" },
  { value: "thread", label: "Thread" },
  { value: "space", label: "Space" },
];

const readFunctionError = (detail: string): string | null => {
  if (!detail) return null;
  try {
    const parsed: unknown = JSON.parse(detail);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "error" in parsed &&
      typeof parsed.error === "string"
    ) {
      return parsed.error;
    }
  } catch {
    return detail;
  }
  return detail;
};

export const ContributionComposer = ({ onSubmitted }: { onSubmitted?: () => void }) => {
  const { session } = useAuth();
  const { toast } = useToast();

  const [postUrl, setPostUrl] = useState("");
  const [urlTouched, setUrlTouched] = useState(false);
  const [contentType, setContentType] = useState("post");
  const [mediaType, setMediaType] = useState<MediaType>("text");
  const [aiGenerated, setAiGenerated] = useState(false);
  const [projectId, setProjectId] = useState<string>("");
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [types, setTypes] = useState<{ value: string; label: string }[]>(DEFAULT_TYPES);
  const [submitting, setSubmitting] = useState(false);
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const [xProfile, setXProfile] = useState<{ x_username: string | null; x_verified: boolean } | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase.from("profiles").select("x_username,x_verified").eq("user_id", session.user.id).maybeSingle()
      .then(({ data }) => setXProfile((data as any) ?? null));
  }, [session?.user?.id]);

  useEffect(() => {
    supabase
      .from("content_types")
      .select("value,label")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) setTypes(data);
      });

    supabase
      .from("projects")
      .select("id,name")
      .order("name")
      .then(({ data }) => setProjects(data ?? []));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) return;

    const cleanUrl = postUrl.trim();
    if (!TWEET_URL_REGEX.test(cleanUrl)) {
      setUrlTouched(true);
      toast({ title: "Invalid X link", description: "Paste a full X post URL (e.g. https://x.com/username/status/12345).", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase.functions.invoke<{ error?: string }>("submit-contribution", {
      body: {
        post_url: cleanUrl,
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
        const context = (error as unknown as { context?: FunctionErrorContext }).context;
        detail = (await context?.text?.()) ?? "";
      } catch {
        detail = "";
      }
      message = readFunctionError(detail) || "We couldn't submit that post right now. Please try again.";
    } else if (data?.error) {
      message = data.error;
    }

    setSubmitting(false);
    if (message) {
      toast({ title: "Post not accepted", description: message, variant: "destructive" });
      return;
    }

    setPostUrl("");
    setUrlTouched(false);
    setAiGenerated(false);
    const pts = (data as any)?.points_earned ?? (data as any)?.contribution?.points_earned;
    setCelebrate(typeof pts === "number" && pts > 0 ? `+${pts} XP` : "Tracked!");
    setTimeout(() => { setCelebrate(null); onSubmitted?.(); }, 1600);
  };

  const trimmedPostUrl = postUrl.trim();
  const urlIsInvalid = trimmedPostUrl.length > 0 && !TWEET_URL_REGEX.test(trimmedPostUrl);
  const match = trimmedPostUrl.match(/^https?:\/\/(?:x\.com|twitter\.com)\/([^/]+)\/status\/(\d+)/);
  const postHandle = match?.[1];
  const myHandle = xProfile?.x_username?.replace(/^@/, "").toLowerCase();
  const notVerified = xProfile && !xProfile.x_verified;
  const notMine = !!(postHandle && myHandle && postHandle.toLowerCase() !== myHandle);

  if (celebrate) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-50 fade-in duration-300">
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-lg shadow-primary/40">
            <Sparkles className="h-8 w-8" />
          </div>
        </div>
        <p className="mt-5 text-2xl font-bold text-primary animate-in slide-in-from-bottom-2 duration-500">{celebrate}</p>
        <p className="mt-1 text-xs text-muted-foreground">Contribution added to your record.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 text-left">
      <div>
        <label htmlFor="post-url-input" className="mb-1 block text-xs font-medium text-foreground">
          X post link <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Link2
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="post-url-input"
            type="url"
            inputMode="url"
            autoComplete="url"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="https://x.com/username/status/..."
            value={postUrl}
            onChange={(e) => setPostUrl(e.target.value)}
            onBlur={() => setUrlTouched(true)}
            className="h-10 pl-9 text-xs"
            required
          />
        </div>
        {urlTouched && urlIsInvalid && (
          <p role="alert" className="mt-1 text-[11px] text-destructive">
            Use a public x.com or twitter.com post link.
          </p>
        )}
        {match && (
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-2.5 animate-in fade-in slide-in-from-top-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold uppercase text-primary">
              {postHandle?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">@{postHandle}</p>
              <p className="truncate font-mono text-[10px] text-muted-foreground">Post {match[2]}</p>
            </div>
            <a href={trimmedPostUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline">Open</a>
          </div>
        )}
        {match && (notVerified || notMine) && (
          <div className="mt-2 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-[11px] text-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
            <div className="flex-1">
              {notVerified
                ? "Your X account isn't verified yet, so this post can't be tracked."
                : `This post is by @${postHandle}, but your verified account is @${myHandle}.`}
              {notVerified && (
                <Link to="/dashboard/settings" className="ml-1 font-semibold text-primary hover:underline">Verify X now →</Link>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="project-select" className="mb-1 block text-xs font-medium text-foreground">
          Project
        </label>
        <select
          id="project-select"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus-visible:outline-none transition-colors"
        >
          <option value="">General RaidFi contribution</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Type</label>
          <div className="flex flex-wrap gap-1">
            {types.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setContentType(type.value)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors capitalize",
                  contentType === type.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Media</label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setMediaType("text")}
              className={cn(
                "flex-1 px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors",
                mediaType === "text"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              )}
            >
              Text only
            </button>
            <button
              type="button"
              onClick={() => setMediaType("image")}
              className={cn(
                "flex-1 px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors",
                mediaType === "image"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              )}
            >
              Visual
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
        <label htmlFor="ai-switch" className="cursor-pointer text-xs text-muted-foreground">
          Created with AI assistance
        </label>
        <Switch id="ai-switch" checked={aiGenerated} onCheckedChange={setAiGenerated} />
      </div>

      <Button
        type="submit"
        className="h-10 w-full text-xs font-semibold"
        disabled={submitting || !trimmedPostUrl}
      >
        {submitting ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-2" />}
        {submitting ? "Tracking..." : "Track contribution"}
      </Button>
    </form>
  );
};

export default ContributionComposer;
