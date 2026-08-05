import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useContributorData } from "@/hooks/useContributorData";
import { useSEO } from "@/hooks/useSEO";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageHeader, Panel, StatCard, StatusPill } from "@/components/dashboard/Primitives";
import ContributionComposer from "@/components/dashboard/ContributionComposer";
import { ExternalLink, Loader2, Sparkles } from "lucide-react";

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
  const data = useContributorData(session?.user?.email);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");

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
            <ContributionComposer onSubmitted={() => data.refresh()} />
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
                        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>
                            {new Date(c.created_at).toLocaleDateString()} · {c.content_type}
                            {c.status === "approved" && ` · +${c.points_earned} XP`}
                          </span>
                          {(c as any).ai_generated && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted text-[10px]">
                              <Sparkles className="w-2.5 h-2.5" /> AI
                            </span>
                          )}
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
