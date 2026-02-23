import { SingleSelect, MultiSelect, TextQuestion } from "./QuestionComponents";

interface StepProps {
  data: Record<string, any>;
  update: (key: string, value: any) => void;
}

export const IndividualStep1 = ({ data, update }: StepProps) => (
  <div className="space-y-5">
    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Background & Activity</h3>
    <SingleSelect
      label="How long have you been active in Web3?"
      options={["< 6 months", "6–12 months", "1–2 years", "2+ years"]}
      value={data.web3_duration || ""}
      onChange={(v) => update("web3_duration", v)}
      required
    />
    <MultiSelect
      label="What best describes you?"
      options={["Community contributor", "Content creator", "Thread writer", "Meme creator", "Moderator", "Builder", "Trader", "Other"]}
      value={data.describes_you || []}
      onChange={(v) => update("describes_you", v)}
      required
    />
    <MultiSelect
      label="Which platforms do you actively contribute on?"
      options={["X", "Farcaster", "Lens", "Discord", "Telegram", "Other"]}
      value={data.platforms || []}
      onChange={(v) => update("platforms", v)}
      required
    />
    <TextQuestion
      label="On average, how many Web3 projects do you actively support weekly?"
      value={data.projects_weekly || ""}
      onChange={(v) => update("projects_weekly", v)}
      placeholder="e.g. 3"
    />
  </div>
);

export const IndividualStep2 = ({ data, update }: StepProps) => (
  <div className="space-y-5">
    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Current Problems</h3>
    <TextQuestion
      label="What is your biggest frustration when contributing to projects?"
      value={data.biggest_frustration || ""}
      onChange={(v) => update("biggest_frustration", v)}
      multiline
      required
    />
    <MultiSelect
      label="Have you experienced any of the following?"
      options={["Contributions not recognized", "Low-effort contributors rewarded equally", "No way to prove impact", "Biased reward distribution", "Manual proof submission"]}
      value={data.experienced_issues || []}
      onChange={(v) => update("experienced_issues", v)}
    />
    <SingleSelect
      label="How do projects currently measure your contribution?"
      options={["They don't", "Screenshots/manual proof", "Bots", "Leaderboards", "I don't know"]}
      value={data.how_measured || ""}
      onChange={(v) => update("how_measured", v)}
    />
    <SingleSelect
      label="Do you feel your Web3 contribution reputation is:"
      options={["Strong and recognized", "Invisible", "Dependent on one community", "Easily replaceable"]}
      value={data.reputation_feeling || ""}
      onChange={(v) => update("reputation_feeling", v)}
    />
  </div>
);

export const IndividualStep3 = ({ data, update }: StepProps) => (
  <div className="space-y-5">
    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Reputation & Data Layer</h3>
    <SingleSelect
      label="If your contribution impact could be automatically tracked across platforms, would you use it?"
      options={["Yes immediately", "Maybe", "Only if rewards attached", "No"]}
      value={data.auto_track_interest || ""}
      onChange={(v) => update("auto_track_interest", v)}
      required
    />
    <SingleSelect
      label="Would you want a portable on-chain contribution reputation?"
      options={["Yes", "Not sure", "No"]}
      value={data.onchain_reputation || ""}
      onChange={(v) => update("onchain_reputation", v)}
    />
    <SingleSelect
      label="What matters more to you?"
      options={["Short-term rewards", "Long-term reputation", "Access to high-quality projects", "Performance visibility"]}
      value={data.what_matters || ""}
      onChange={(v) => update("what_matters", v)}
    />
    <SingleSelect
      label="Would you connect your wallet and social accounts to a platform that verifies your contribution data?"
      options={["Yes", "Maybe", "No"]}
      value={data.connect_wallet || ""}
      onChange={(v) => update("connect_wallet", v)}
    />
  </div>
);

export const IndividualStep4 = ({ data, update }: StepProps) => (
  <div className="space-y-5">
    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Activation Layer</h3>
    <SingleSelect
      label="If a project launches a Contribution Pool (structured reward campaign with tracked metrics), would you participate?"
      options={["Yes", "Maybe", "No"]}
      value={data.pool_participate || ""}
      onChange={(v) => update("pool_participate", v)}
      required
    />
    <MultiSelect
      label="What type of pools interest you?"
      options={["Engagement-based", "Content-based", "On-chain action + social", "Long-term ambassador programs"]}
      value={data.pool_types || []}
      onChange={(v) => update("pool_types", v)}
    />
    <SingleSelect
      label="Do you prefer:"
      options={["Competing individually", "Team-based contribution", "Both"]}
      value={data.contribution_style || ""}
      onChange={(v) => update("contribution_style", v)}
    />
  </div>
);

export const IndividualStep5 = ({ data, update }: StepProps) => (
  <div className="space-y-5">
    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Monetization & Signal</h3>
    <SingleSelect
      label="Would you pay for advanced analytics about your performance?"
      options={["No", "Maybe", "Yes"]}
      value={data.pay_analytics || ""}
      onChange={(v) => update("pay_analytics", v)}
    />
    <SingleSelect
      label="If RaidFi launched tomorrow in beta, would you actively use it weekly?"
      options={["Yes", "Maybe", "No"]}
      value={data.use_weekly || ""}
      onChange={(v) => update("use_weekly", v)}
      required
    />
    <TextQuestion
      label="What would make you trust a contribution tracking platform?"
      value={data.trust_factor || ""}
      onChange={(v) => update("trust_factor", v)}
      multiline
    />
    <TextQuestion
      label="Drop your X handle (optional)"
      value={data.x_handle || ""}
      onChange={(v) => update("x_handle", v)}
      placeholder="@yourhandle"
    />
  </div>
);
