const features = [
  {
    title: "Persistent Contributor Reputation",
    description: "A reputation system built from verified performance data. Cross-project scoring and historical credibility tracking.",
  },
  {
    title: "Cross-Platform Social Intelligence",
    description: "Aggregation across X, Farcaster, Telegram, and on-chain interactions — normalized into a single framework.",
  },
  {
    title: "Contributor & Team Analytics",
    description: "Individual performance history, team reputation, comparative analytics, and leaderboard intelligence.",
  },
  {
    title: "Structured Campaign Infrastructure",
    description: "Campaign deployment with autonomous tracking, performance-weighted reward pools, and reputation impact.",
  },
  {
    title: "Intelligence Dashboards",
    description: "Social ROI metrics, community strength diagnostics, contributor segmentation, and growth forecasting.",
  },
  {
    title: "Reputation-Based Access Control",
    description: "Gate campaigns by credibility score. Tiered access with verified contributor filtering.",
  },
  {
    title: "Multi-Signal Influence Engine",
    description: "Scoring engine analyzing reach velocity, engagement depth, amplification patterns, and signal-to-noise ratios.",
  },
  {
    title: "Data Export & Integrations",
    description: "Exportable contributor intelligence, DAO tooling integration, and plug-in layer for partner ecosystems.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3 tracking-wide uppercase">Platform</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Why RaidFi?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-xl p-5 bg-background border border-border hover:border-primary/30 transition-colors"
            >
              <h3 className="text-sm font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
