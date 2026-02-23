import { SingleSelect, MultiSelect, TextQuestion } from "./QuestionComponents";

interface StepProps {
  data: Record<string, any>;
  update: (key: string, value: any) => void;
}

export const ProjectStep1 = ({ data, update }: StepProps) => (
  <div className="space-y-5">
    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Project Profile</h3>
    <TextQuestion
      label="Project name"
      value={data.project_name || ""}
      onChange={(v) => update("project_name", v)}
      placeholder="Your project name"
      required
    />
    <TextQuestion
      label="Chain (if applicable)"
      value={data.chain || ""}
      onChange={(v) => update("chain", v)}
      placeholder="e.g. Solana, Ethereum, Base"
    />
    <SingleSelect
      label="Stage"
      options={["Pre-launch", "Live", "Scaling", "Post-TGE"]}
      value={data.stage || ""}
      onChange={(v) => update("stage", v)}
      required
    />
    <TextQuestion
      label="Team size"
      value={data.team_size || ""}
      onChange={(v) => update("team_size", v)}
      placeholder="e.g. 5"
    />
  </div>
);

export const ProjectStep2 = ({ data, update }: StepProps) => (
  <div className="space-y-5">
    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Growth & Contribution Strategy</h3>
    <MultiSelect
      label="How do you currently drive attention and growth?"
      options={["Organic social", "Influencers", "Community programs", "Paid ads", "Ambassador programs"]}
      value={data.growth_methods || []}
      onChange={(v) => update("growth_methods", v)}
      required
    />
    <SingleSelect
      label="Do you actively track community contributions?"
      options={["Yes", "Partially", "No"]}
      value={data.track_contributions || ""}
      onChange={(v) => update("track_contributions", v)}
    />
    <MultiSelect
      label="How do you measure contribution performance today?"
      options={["Impressions", "Engagement", "Wallet activity", "Conversions", "Manual tracking", "We don't measure"]}
      value={data.measure_methods || []}
      onChange={(v) => update("measure_methods", v)}
    />
    <SingleSelect
      label="Do you know your top 20% most impactful contributors?"
      options={["Yes clearly", "Rough idea", "No"]}
      value={data.know_top_contributors || ""}
      onChange={(v) => update("know_top_contributors", v)}
    />
  </div>
);

export const ProjectStep3 = ({ data, update }: StepProps) => (
  <div className="space-y-5">
    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Pain & Gaps</h3>
    <MultiSelect
      label="What is your biggest challenge in managing community contributions?"
      options={["Fake engagement", "Low-quality content", "Hard to measure ROI", "No visibility into real impact", "Manual management", "Poor retention"]}
      value={data.challenges || []}
      onChange={(v) => update("challenges", v)}
      required
    />
    <SingleSelect
      label="Do you trust your current engagement data?"
      options={["Yes", "Not fully", "No"]}
      value={data.trust_data || ""}
      onChange={(v) => update("trust_data", v)}
    />
    <SingleSelect
      label="Have you ever rewarded contributors without knowing actual performance impact?"
      options={["Yes", "No"]}
      value={data.rewarded_blind || ""}
      onChange={(v) => update("rewarded_blind", v)}
    />
  </div>
);

export const ProjectStep4 = ({ data, update }: StepProps) => (
  <div className="space-y-5">
    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Contribution Intelligence</h3>
    <MultiSelect
      label="Would you use a platform that:"
      options={["Automatically tracks cross-platform contributions", "Scores contributors based on real impact", "Filters noise from quality", "Combines on-chain + off-chain data"]}
      value={data.platform_features || []}
      onChange={(v) => update("platform_features", v)}
      required
    />
    <MultiSelect
      label="What metrics matter most to you?"
      options={["Conversions", "Wallet activity", "Quality discussions", "Reach", "Retention", "Growth velocity"]}
      value={data.metrics || []}
      onChange={(v) => update("metrics", v)}
    />
    <SingleSelect
      label="Would contributor reputation influence who you allow into private programs?"
      options={["Yes", "Maybe", "No"]}
      value={data.reputation_influence || ""}
      onChange={(v) => update("reputation_influence", v)}
    />
    <SingleSelect
      label="Would you prefer:"
      options={["Public contribution programs", "Private curated contributor groups", "Both"]}
      value={data.program_preference || ""}
      onChange={(v) => update("program_preference", v)}
    />
  </div>
);

export const ProjectStep5 = ({ data, update }: StepProps) => (
  <div className="space-y-5">
    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Contribution Pools</h3>
    <MultiSelect
      label="Would you launch structured Contribution Pools if:"
      options={["Tracking was automated", "Performance was transparent", "Top contributors were ranked", "Impact could be proven"]}
      value={data.pool_conditions || []}
      onChange={(v) => update("pool_conditions", v)}
    />
    <SingleSelect
      label="What budget do you allocate monthly for growth/community tools?"
      options={["$0", "$50–200", "$200–1k", "$1k+"]}
      value={data.monthly_budget || ""}
      onChange={(v) => update("monthly_budget", v)}
    />
    <SingleSelect
      label="If RaidFi solved contribution tracking and quality filtering, would you integrate within 30 days?"
      options={["Yes", "Maybe", "No"]}
      value={data.integrate_30d || ""}
      onChange={(v) => update("integrate_30d", v)}
      required
    />
    <TextQuestion
      label="What would make you switch from your current system?"
      value={data.switch_reason || ""}
      onChange={(v) => update("switch_reason", v)}
      multiline
    />
  </div>
);
