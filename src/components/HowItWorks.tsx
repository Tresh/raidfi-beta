const steps = [
{
  number: "01",
  title: "Capture",
  description: "RaidFi monitors social participation across supported platforms and on-chain interactions connected to Web3 communities.",
  subtitle: null,
  items: [
  "Engagement behavior",
  "Mention velocity",
  "Influence spread",
  "Community growth patterns"],

  footer: "All signals are structured automatically."
},
{
  number: "02",
  title: "Analyze",
  description: "Behavioral signals are evaluated to measure contribution quality, reach efficiency, consistency, and influence.",
  subtitle: null,
  items: [
  "Contribution quality",
  "Reach efficiency",
  "Consistency over time",
  "Influence depth"],

  footer: "Social activity becomes structured impact."
},
{
  number: "03",
  title: "Build Reputation",
  description: "Performance history feeds into a persistent reputation graph that compounds over time and travels with contributors.",
  subtitle: null,
  items: [
  "Portable across ecosystems",
  "Reflects long-term credibility",
  "Differentiates signal from noise",
  "Builds compounding social capital"],

  footer: "Earned through measurable contribution."
},
{
  number: "04",
  title: "Unlock Access",
  description: "Projects gain structured analytics on contributors and communities, enabling data-driven decisions instead of guesswork.",
  subtitle: null,
  items: [
  "Contributor performance analytics",
  "Community strength metrics",
  "Influence mapping",
  "Data-backed decision support"],

  footer: "Decisions move from assumptions to verified data."
}];


const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">

          </h2>
          <p className="text-muted-foreground">From Activity → Intelligence → Reputation

          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step) =>
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
              {step.subtitle &&
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                  {step.subtitle}
                </p>
            }
              <div className="space-y-2 mb-4">
                {step.items.map((item, i) =>
              <div key={i} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
              )}
              </div>
              <p className="text-xs text-muted-foreground italic">
                {step.footer}
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12 max-w-2xl mx-auto">

        </p>
      </div>
    </section>);

};

export default HowItWorks;