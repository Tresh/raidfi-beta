const features = [
  {
    title: "Social Identity Profiles",
    description: "Portable contributor identity that tracks verified contributions across campaigns and platforms"
  },
  {
    title: "Raid Team Infrastructure",
    description: "Public and private raid teams with collective reputation, performance history, and coordination tools"
  },
  {
    title: "Influence Scoring Engine",
    description: "Multi-signal analysis of reach, relevance, engagement quality, and sustained visibility"
  },
  {
    title: "Performance Analytics",
    description: "Real-time dashboards for contributor performance, campaign health, and social ROI metrics"
  },
  {
    title: "Cross-Platform Tracking",
    description: "Unified tracking across X, Discord, Telegram, and on-chain activity in one intelligence layer"
  },
  {
    title: "Campaign Intelligence Reports",
    description: "Structured post-campaign reports with contributor rankings, engagement data, and actionable insights"
  },
  {
    title: "Reputation-Based Access",
    description: "Gate campaigns, tiers, and opportunities based on verified contribution history and reputation score"
  },
  {
    title: "Data Exports & Integrations",
    description: "Export contributor data and analytics to feed into project workflows, DAOs, and partner platforms"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            Infrastructure Features
          </h2>
          <p className="text-muted-foreground">
            Web3-native social data infrastructure, built for community and projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card rounded-xl p-5 hover:border-primary/20 hover:glow-cyan transition-all duration-500 group"
            >
              <h3 className="text-base font-medium mb-2 text-foreground group-hover:text-primary transition-colors">
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
