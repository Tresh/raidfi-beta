const features = [
  {
    title: "Persistent Social Reputation Graph",
    description: "A continuously evolving reputation system built from verified performance data. Cross-project scoring, historical credibility tracking, and Sybil-resistant signal weighting."
  },
  {
    title: "Multi-Signal Influence Engine",
    description: "Proprietary scoring engine analyzing reach velocity, engagement depth, network amplification patterns, consistency over time, and signal-to-noise ratios."
  },
  {
    title: "Unified Social Data Index",
    description: "Cross-platform aggregation across X, Farcaster, Telegram, and on-chain interactions, all normalized into a single intelligence framework."
  },
  {
    title: "Campaign & Activation Infrastructure",
    description: "Structured campaign deployment with autonomous contribution tracking, built-in reward pool distribution, and performance-weighted payouts."
  },
  {
    title: "Contributor & Team Performance Layer",
    description: "Individual performance history, team collective reputation, comparative contributor analytics, and leaderboard intelligence driving retention loops."
  },
  {
    title: "Intelligence Dashboards",
    description: "Social ROI metrics, community strength diagnostics, contributor segmentation, engagement efficiency analysis, and growth trend forecasting."
  },
  {
    title: "Reputation-Based Access Control",
    description: "Gate campaigns by credibility score. Tiered opportunity systems with verified contributor filtering and anti-farm protection through historical performance."
  },
  {
    title: "Data Portability & Integrations",
    description: "Exportable contributor intelligence, DAO tooling integration, analytics API potential, and plug-in layer for partner ecosystems."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            Infrastructure Layer
          </h2>
          <p className="text-muted-foreground">
            The intelligence and reputation backbone for Web3 social ecosystems
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card rounded-xl p-5 hover:border-primary/20 transition-all duration-300"
            >
              <h3 className="text-base font-medium mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
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
