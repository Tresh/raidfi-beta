import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  AlignLeft,
  Check,
  FileText,
  Image as ImageIcon,
  Link2,
  ListTree,
  Loader2,
  MessageSquareText,
  Mic2,
  Quote,
  Send,
  type LucideIcon,
} from "lucide-react";

const TWEET_URL_REGEX = /^https?:\/\/(x\.com|twitter\.com)\/[^/]+\/status\/(\d+)/;

type MediaType = "text" | "image";

type FunctionErrorContext = {
  text?: () => Promise<string>;
};

type ChoiceTileProps = {
  name: string;
  value: string;
  selected: boolean;
  label: string;
  hint: string;
  icon: LucideIcon;
  onChange: (value: string) => void;
};

const ChoiceTile = ({ name, value, selected, label, hint, icon: Icon, onChange }: ChoiceTileProps) => (
  <label className="block cursor-pointer">
    <input
      type="radio"
      name={name}
      value={value}
      checked={selected}
      onChange={() => onChange(value)}
      className="peer sr-only"
      required
    />
    <span
      className={cn(
        "flex min-h-[3.75rem] items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors",
        "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/60",
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn("h-4 w-4 shrink-0", selected ? "text-primary" : "text-muted-foreground")}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold leading-4">{label}</span>
        <span className="mt-0.5 block text-[10px] leading-3.5 text-muted-foreground">{hint}</span>
      </span>
      {selected && <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />}
    </span>
  </label>
);

const getContentTypeMeta = (value: string): { hint: string; icon: LucideIcon } => {
  switch (value) {
    case "post":
      return { hint: "A standalone X post", icon: MessageSquareText };
    case "quote":
      return { hint: "Adds your take to another post", icon: Quote };
    case "thread":
      return { hint: "A connected series of posts", icon: ListTree };
    case "space":
      return { hint: "A live or recorded X Space", icon: Mic2 };
    default:
      return { hint: "Choose if this best matches", icon: FileText };
  }
};

const readFunctionError = (detail: string): string | null => {
  if (!detail) return null;

  try {
    const parsed: unknown = JSON.parse(detail);
    if (
      typeof parsed === "object"
      && parsed !== null
      && "error" in parsed
      && typeof parsed.error === "string"
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
  const [contentType, setContentType] = useState("");
  const [mediaType, setMediaType] = useState<MediaType | "">("");
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
      .then(({ data }) => setTypes(data ?? []));

    supabase
      .from("projects")
      .select("id,name")
      .eq("status", "active")
      .order("name")
      .then(({ data }) => setProjects(data ?? []));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) return;
    if (!TWEET_URL_REGEX.test(postUrl.trim())) {
      setUrlTouched(true);
      toast({ title: "Invalid link", description: "Paste a full X post URL.", variant: "destructive" });
      return;
    }
    if (!contentType || !mediaType) {
      toast({
        title: "Choose the post details",
        description: "Select a post type and media format before continuing.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);

    const { data, error } = await supabase.functions.invoke<{ error?: string }>("submit-contribution", {
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
        const context = (error as unknown as { context?: FunctionErrorContext }).context;
        detail = (await context?.text?.()) ?? "";
      } catch {
        detail = "";
      }
      message = readFunctionError(detail);
      message = message || "We couldn't submit that post right now. Please try again.";
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
    setContentType("");
    setMediaType("");
    toast({ title: "Contribution tracked", description: "It will be scored after review." });
    onSubmitted?.();
  };

  const trimmedPostUrl = postUrl.trim();
  const urlIsInvalid = trimmedPostUrl.length > 0 && !TWEET_URL_REGEX.test(trimmedPostUrl);
  const availableTypes = types.length ? types : [{ value: "post", label: "Post" }];

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="post-url-input" className="mb-1.5 block text-sm font-medium text-foreground">
          X post link <span aria-hidden="true" className="text-destructive">*</span>
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
            className="h-11 pl-10 text-sm"
            aria-required="true"
            aria-invalid={urlTouched && urlIsInvalid}
            aria-describedby="post-url-help"
            required
          />
        </div>
        <p
          id="post-url-help"
          role={urlTouched && urlIsInvalid ? "alert" : undefined}
          className={cn(
            "mt-1.5 text-[11px] leading-4",
            urlTouched && urlIsInvalid ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {urlTouched && urlIsInvalid
            ? "Use the full link to a public post on x.com or twitter.com."
            : "Paste a public post from your verified X account."}
        </p>
      </div>

      <div>
        <label htmlFor="project-select" className="mb-1.5 block text-sm font-medium text-foreground">
          Which project is this for?
        </label>
        <select
          id="project-select"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">RaidFi general (no specific project)</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground">
          Project posts will also appear in that project&apos;s workspace.
        </p>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Classify your post</p>
          <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">Choose one option in each row for review.</p>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-foreground">
            Post type <span aria-hidden="true" className="text-destructive">*</span>
          </legend>
          <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
            {availableTypes.map((type) => {
              const meta = getContentTypeMeta(type.value);
              return (
                <ChoiceTile
                  key={type.value}
                  name="content-type"
                  value={type.value}
                  selected={contentType === type.value}
                  label={type.label}
                  hint={meta.hint}
                  icon={meta.icon}
                  onChange={setContentType}
                />
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-foreground">
            Media format <span aria-hidden="true" className="text-destructive">*</span>
          </legend>
          <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
            <ChoiceTile
              name="media-type"
              value="text"
              selected={mediaType === "text"}
              label="Text only"
              hint="No image or visual"
              icon={AlignLeft}
              onChange={(value) => setMediaType(value as MediaType)}
            />
            <ChoiceTile
              name="media-type"
              value="image"
              selected={mediaType === "image"}
              label="Image or visual"
              hint="Photo, graphic, or meme"
              icon={ImageIcon}
              onChange={(value) => setMediaType(value as MediaType)}
            />
          </div>
        </fieldset>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2.5">
        <label htmlFor="ai-switch" className="cursor-pointer">
          <span className="block text-xs font-medium text-foreground">Created with AI</span>
          <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">Disclosure only. It won&apos;t lower your score.</span>
        </label>
        <Switch id="ai-switch" aria-label="Created with AI" checked={aiGenerated} onCheckedChange={setAiGenerated} />
      </div>

      <Button
        type="submit"
        className="h-11 w-full text-sm"
        disabled={submitting || !trimmedPostUrl || !contentType || !mediaType}
      >
        {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
        {submitting ? "Tracking..." : "Track contribution"}
      </Button>
      <p className="text-[11px] leading-4 text-muted-foreground">
        Only posts from your verified X account can be reviewed. Approved submissions affect your reputation.
      </p>
    </form>
  );
};

export default ContributionComposer;
