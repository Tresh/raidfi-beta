import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import type { ActivityRow } from "@/hooks/useProjectData";

export const decodeEntities = (s: string) =>
  s
    .replace(/&mdash;/g, "-")
    .replace(/&ndash;/g, "–")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const tweetId = (url: string) => /status\/(\d+)/.exec(url)?.[1] ?? null;

const PostImage = ({ postUrl, className = "" }: { postUrl: string; className?: string }) => {
  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!tweetId(postUrl)) {
      setDone(true);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => !cancelled && setDone(true), 6000);
    (async () => {
      try {
        const { data } = await supabase.functions.invoke("fetch-post-image", { body: { post_url: postUrl } });
        if (cancelled) return;
        if (data?.post_image_url) setSrc(data.post_image_url);
        else setDone(true);
      } catch {
        if (!cancelled) setDone(true);
      } finally {
        window.clearTimeout(timer);
      }
    })();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [postUrl]);

  if (done && !src) return null;

  return (
    <div className={`relative overflow-hidden rounded-md border border-border bg-muted ${className}`}>
      {src && (
        <img
          src={src}
          alt="Post media"
          loading="lazy"
          onLoad={() => {
            setLoaded(true);
            setDone(true);
          }}
          onError={() => {
            setSrc(null);
            setDone(true);
          }}
          className={`w-full h-full object-cover transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
      {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
    </div>
  );
};

const Tag = ({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "primary" }) => (
  <span
    className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
      tone === "primary" ? "bg-primary/10 text-primary" : "border border-border text-muted-foreground"
    }`}
  >
    {children}
  </span>
);

const PostCard = ({ post, onExpand }: { post: ActivityRow; onExpand: () => void }) => {
  const text = post.post_text ? decodeEntities(post.post_text) : "";
  const long = text.length > 220;

  return (
    <article className="flex flex-col border border-border rounded-xl bg-card overflow-hidden">
      <div className="flex items-start justify-between gap-2 px-3.5 pt-3.5">
        <div className="min-w-0">
          {post.referral_code ? (
            <Link
              to={`/u/${post.referral_code}`}
              target="_blank"
              className="text-[13px] font-medium text-foreground hover:text-primary truncate block"
            >
              {post.display_name}
            </Link>
          ) : (
            <p className="text-[13px] font-medium text-foreground truncate">{post.display_name}</p>
          )}
          {post.x_username && (
            <p className="text-[11px] text-muted-foreground truncate">@{post.x_username.replace(/^@/, "")}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {post.score != null && <Tag tone="primary">{post.score}/100</Tag>}
          <Tag>{post.status}</Tag>
        </div>
      </div>

      <div className="px-3.5 pt-2.5 flex-1">
        {text ? (
          <p className="text-[12.5px] leading-relaxed text-foreground/90 whitespace-pre-wrap line-clamp-5">{text}</p>
        ) : (
          <p className="text-[12.5px] text-muted-foreground italic">No saved text for this post.</p>
        )}
        {long && (
          <button onClick={onExpand} className="mt-1 text-[11.5px] text-primary hover:underline">
            See more
          </button>
        )}
      </div>

      <div className="px-3.5 pt-3">
        <PostImage postUrl={post.post_url} className="aspect-[16/10]" />
      </div>

      <div className="px-3.5 py-3 mt-2 flex items-center gap-2.5 text-[11px] text-muted-foreground border-t border-border/70">
        <span>{new Date(post.created_at).toLocaleDateString()}</span>
        <span>+{post.points_earned} XP</span>
        {post.ai_generated && <span>AI-assisted</span>}
        <a
          href={post.post_url}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1 text-primary hover:underline"
        >
          Open <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </article>
  );
};

const PostGrid = ({ posts }: { posts: ActivityRow[] }) => {
  const [expanded, setExpanded] = useState<ActivityRow | null>(null);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 items-start">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} onExpand={() => setExpanded(p)} />
        ))}
      </div>

      <Dialog open={Boolean(expanded)} onOpenChange={(o) => !o && setExpanded(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {expanded && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base">
                  {expanded.display_name}
                  {expanded.x_username && (
                    <span className="text-xs font-normal text-muted-foreground ml-1.5">
                      @{expanded.x_username.replace(/^@/, "")}
                    </span>
                  )}
                </DialogTitle>
              </DialogHeader>
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-foreground/90">
                {expanded.post_text ? decodeEntities(expanded.post_text) : "No saved text for this post."}
              </p>
              <PostImage postUrl={expanded.post_url} />
              <div className="flex items-center gap-2.5 text-[11.5px] text-muted-foreground">
                <span>{new Date(expanded.created_at).toLocaleString()}</span>
                <span>+{expanded.points_earned} XP</span>
                {expanded.score != null && <span>score {expanded.score}/100</span>}
                <a
                  href={expanded.post_url}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Open on X <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostGrid;
