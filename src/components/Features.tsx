const features = [
{
  title: "Persistent Contributor Reputation",
  description: "A reputation system built from verified performance data. Cross-project scoring and historical credibility tracking."
},
{
  title: "Cross-Platform Social Intelligence",
  description: "Aggregation across X, Farcaster, Telegram, and on-chain interactions — normalized into a single intelligence framework."
},
{
  title: "Contributor & Team Analytics",
  description: "Individual performance history, team reputation, comparative analytics, and leaderboard intelligence."
},
{
  title: "Structured Campaign Infrastructure",
  description: "Campaign deployment with autonomous tracking, performance-weighted reward pools, and reputation impact for contributors."
},
{
  title: "Intelligence Dashboards",
  description: "Social ROI metrics, community strength diagnostics, contributor segmentation, and growth trend forecasting."
},
{
  title: "Reputation-Based Access Control",
  description: "Gate campaigns by credibility score. Tiered access with verified contributor filtering and anti-farm protection."
},
{
  title: "Multi-Signal Influence Engine",
  description: "Scoring engine analyzing reach velocity, engagement depth, amplification patterns, and signal-to-noise ratios."
},
{
  title: "Data Export & Integrations",
  description: "Exportable contributor intelligence, DAO tooling integration, and plug-in layer for partner ecosystems."
}];


const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            Why RaidFi?
          </h2>
          <p className="text-muted-foreground">

          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) =>
          <div
            key={index}
            className="glass-card rounded-xl p-5 hover:border-primary/20 transition-all duration-300">
            
              <h3 className="text-base font-medium mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>);

};

export default Features;