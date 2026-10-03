import { useAuth } from "@/hooks/useAuth";
import { useContributorData } from "@/hooks/useContributorData";
import { useSEO } from "@/hooks/useSEO";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageHeader, Panel, ScoreMeter, StatCard } from "@/components/dashboard/Primitives";
import { TIERS } from "@/lib/reputation";
import { Loader2, ShieldCheck, CreditCard } from "lucide-react";
import RaidCard from "@/components/dashboard/RaidCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Reputation = () => {
  useSEO({
    title: "Reputation - RaidFi",
    description: "Your behavior-based RaidFi reputation score and the signals behind it.",
    path: "/dashboard/reputation",
  });
  const { session } = useAuth();
  const data = useContributorData(session?.user?.email);
  const rep = data.reputation;
  const nextTier = TIERS.find((t) => t.min > rep.score);

  return (
    <DashboardLayout>
      <PageHeader
        title="Reputation"
        subtitle="Behavior-based, longitudinal, non-transferable. Built from your contribution history."
      />

      {data.loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4 pb-24">
          <div className="bg-card border border-border rounded-lg p-5 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  Reputation score
                </p>
                <p className="text-5xl font-semibold text-foreground tabular-nums leading-none mt-2">
                  {rep.score}
                  <span className="text-lg text-muted-foreground font-normal"> / 1000</span>
                </p>
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {rep.tier.name}
                </div>
                <p className="text-xs text-muted-foreground max-w-md">{rep.tier.blurb}</p>
                <div className="mt-3">
                  <ScoreMeter value={rep.score / 10} />
                  {nextTier && (
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      {nextTier.min - rep.score} points to {nextTier.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Active weeks" value={`${rep.activeWeeks}/12`} />
            <StatCard label="Current streak" value={`${rep.currentStreakWeeks}w`} />
            <StatCard label="Acceptance" value={`${Math.round(rep.approvalRate * 100)}%`} />
            <StatCard label="Avg. quality" value={rep.avgQuality.toFixed(1)} />
          </div>

          <Panel title="Signal breakdown" description="Each pillar is weighted; volume alone cannot carry a score.">
            <div className="space-y-4">
              {rep.pillars.map((p) => (
                <div key={p.key}>
                  <div className="flex items-baseline justify-between gap-3 mb-1.5">
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        {p.label}
                        <span className="ml-2 text-[10px] text-muted-foreground">
                          weight {Math.round(p.weight * 100)}%
                        </span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">{p.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground tabular-nums">
                      {Math.round(p.value)}
                    </span>
                  </div>
                  <ScoreMeter value={p.value} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Tier ladder" description="Thresholds are fixed and identical for every contributor.">
            <ul className="divide-y divide-border">
              {TIERS.map((t) => (
                <li key={t.name} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div>
                    <p
                      className={`text-xs font-medium ${
                        t.name === rep.tier.name ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {t.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{t.blurb}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                    {t.min}+
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Accordion type="single" collapsible className="w-full bg-card border border-border rounded-lg px-5">
            <AccordionItem value="raid-card" className="border-none">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2 text-left">
                  <CreditCard className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Get RaidCard</p>
                    <p className="text-xs text-muted-foreground font-normal">
                      Preview, download, or share your digital contributor ID card.
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-5">
                <RaidCard data={data} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Reputation;
