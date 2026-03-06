const problems = [
  {
    title: "Surface Metrics",
    description: "Projects rely on surface metrics. There's no structured way to measure real contribution impact.",
  },
  {
    title: "No Portable Reputation",
    description: "Contributors cannot carry reputation across ecosystems. Performance disappears after every campaign.",
  },
  {
    title: "No Contribution Infrastructure",
    description: "Protocols depend on social participation to grow, yet none of it is structured.",
  },
  {
    title: "Fragmented Data",
    description: "On-chain and off-chain social activity exist in silos with no unified intelligence layer.",
  },
  {
    title: "Assumptions Over Evidence",
    description: "The result is a system driven by assumptions instead of evidence.",
  },
];

const Problem = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3 tracking-wide uppercase">The Problem</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Web3 Runs on Contributors
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            But contribution has no infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="rounded-xl p-6 bg-background border border-border hover:border-primary/30 transition-colors"
            >
              <h3 className="text-base font-semibold mb-2 text-foreground">
                {problem.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
