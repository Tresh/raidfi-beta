import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useContributorData } from "@/hooks/useContributorData";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageHeader, Panel, StatCard, StatusPill } from "@/components/dashboard/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Loader2, Send } from "lucide-react";

const TWEET_URL_REGEX = /^https?:\/\/(x\.com|twitter\.com)\/[^/]+\/status\/(\d+)/;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "approved", label: "Accepted" },
  { key: "pending", label: "In review" },
  { key: "rejected", label: "Rejected" },
] as const;

const DashContributions = () => {
  useSEO({
    title: "Contributions — RaidFi",
    description: "Track and submit your contributions to the RaidFi reputation network.",
    path: "/dashboard/contributions",
  });
  const { session } = useAuth();
  const { toast } = useToast();
  const data = useContributorData(session?.user?.email);

  const [postUrl, setPostUrl] = useState("");
  const [contentType, setContentType] = useState("post");
  const [types, setTypes] = useState<{ value: string; label: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");

  useEffect(() => {
    supabase
      .from("content_types")
      .select("value,label")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setTypes((data as any) ?? []));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = session?.user?.email?.toLowerCase();
    if (!email) return;
    if (!TWEET_URL_REGEX.test(postUrl.trim())) {
      toast({ title: "Invalid link", description: "Paste a full X post URL.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { data: inserted, error } = await supabase
      .from("contributions")
      .insert({
        user_email: email,
        user_id: session?.user?.id,
        post_url: postUrl.trim(),
        content_type: contentType,
      })
      .select("id")
      .maybeSingle();

    if (error) {
      toast({ title: "Could not submit", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    if (inserted?.id) {
      supabase.functions.invoke("fetch-post-text", { body: { contribution_id: inserted.id } }).catch(() => {});
      supabase.functions.invoke("notify-admin-contribution", { body: { contribution_id: inserted.id } }).catch(() => {});
    }

    setPostUrl("");
    toast({ title: "Contribution tracked", description: "It will be scored after review." });
    await data.refresh();
    setSubmitting(false);
  };

  const rows = data.contributions.filter((c) => (filter === "all" ? true : c.status === filter));
  const rep = data.reputation;

  return (
    <DashboardLayout>
      <PageHeader
        title="Contributions"
        subtitle="Every tracked contribution feeds your reputation signal."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Submitted" value={rep.totalCount} />
        <StatCard label="Accepted" value={rep.approvedCount} accent />
        <StatCard label="Acceptance rate" value={`${Math.round(rep.approvalRate * 100)}%`} />
        <StatCard label="Avg. score" value={rep.avgQuality.toFixed(1)} hint="Per accepted item" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <Panel title="Track a contribution" description="Submit an X post to add it to your record.">
            <form onSubmit={submit} className="space-y-3">
              <Input
                placeholder="https://x.com/user/status/..."
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                className="h-10 text-sm"
              />
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                {(types.length ? types : [{ value: "post", label: "Post" }]).map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <Button type="submit" className="w-full h-10 text-sm" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Submit
              </Button>
              <p className="text-[11px] text-muted-foreground">
                Submissions are reviewed before they affect reputation. Quality and consistency matter
                more than volume.
              </p>
            </form>
          </Panel>
        </div>

        <div className="lg:col-span-2">
          <Panel
            title="Contribution record"
            description={`${rows.length} item${rows.length === 1 ? "" : "s"}`}
            action={
              <div className="flex gap-1">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`text-[11px] px-2 py-1 rounded-md transition-colors ${
                      filter === f.key
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            }
          >
            {data.loading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : rows.length === 0 ? (
              <p className="text-xs text-muted-foreground py-10 text-center">Nothing here yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {rows.map((c) => (
                  <li key={c.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-foreground line-clamp-2">
                          {c.post_text?.replace(/&mdash;/g, "—") || c.post_url}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {new Date(c.created_at).toLocaleDateString()} · {c.content_type}
                          {c.status === "approved" && ` · +${c.points_earned} XP`}
                        </p>
                        {c.ai_feedback && (
                          <p className="text-[11px] text-muted-foreground mt-1 italic line-clamp-2">
                            {c.ai_feedback}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusPill status={c.status} />
                        <a href={c.post_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                        </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashContributions;
