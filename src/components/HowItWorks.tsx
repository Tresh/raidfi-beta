const steps = [
  {
    number: "01",
    title: "Social Activity Is Captured",
    description: "RaidFi monitors on-chain and off-chain interactions connected to projects, contributors, and communities.",
    subtitle: "We analyze:",
    items: [
      "Engagement behavior",
      "Mention velocity",
      "Influence spread",
      "Community growth patterns",
      "Network amplification",
    ],
    footer: "All signals are structured automatically.",
  },
  {
    number: "02",
    title: "Data Becomes Performance Intelligence",
    description: "Every interaction is processed into measurable performance metrics.",
    subtitle: "We evaluate:",
    items: [
      "Contribution quality",
      "Reach efficiency",
      "Consistency over time",
      "Influence depth",
      "Signal strength",
    ],
    footer: "Social activity becomes structured impact.",
  },
  {
    number: "03",
    title: "Reputation Is Built in Real Time",
    description: "Verified performance feeds into a persistent reputation graph.",
    subtitle: "Reputation:",
    items: [
      "Travels with contributors",
      "Reflects long-term credibility",
      "Differentiates signal from noise",
      "Builds compounding social capital",
    ],
    footer: "Earned through measurable contribution.",
  },
  {
    number: "04",
    title: "Projects Access Actionable Insights",
    description: "Projects gain access to structured intelligence, including:",
    subtitle: null,
    items: [
      "Contributor performance analytics",
      "Community strength metrics",
      "Influence mapping",
      "Growth diagnostics",
      "Data-backed decision support",
    ],
    footer: "Decisions move from assumptions to verified data.",
  },
  {
    number: "05",
    title: "Launch Structured Campaigns",
    description: "Projects can deploy structured on-chain campaigns directly within the system.",
    subtitle: "Campaign performance:",
    items: [
      "Is tracked autonomously",
      "Feeds into the reputation layer",
      "Includes reward pool distribution",
      "Contributes to long-term credibility",
    ],
    footer: "Campaigns become measurable components of a larger intelligence framework.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            How RaidFi Works
          </h2>
          <p className="text-muted-foreground">
            RaidFi transforms social activity into structured data and persistent credibility.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="glass-card rounded-xl p-6 hover:border-primary/20 transition-all duration-300">
              <p className="text-primary text-xs font-medium mb-3 uppercase tracking-wider">
                {step.number}
              </p>
              <h3 className="text-lg font-medium mb-2 text-foreground">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {step.description}
              </p>
              {step.subtitle && (
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                  {step.subtitle}
                </p>
              )}
              <div className="space-y-2 mb-4">
                {step.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic">
                {step.footer}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12 max-w-2xl mx-auto">
          RaidFi turns social performance into data, and data into credibility.
        </p>
      </div>
    </section>
  );
};

export default HowItWorks;
