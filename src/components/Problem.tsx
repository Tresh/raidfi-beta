const problems = [
  {
    title: "Surface Metrics",
    description: "Projects rely on surface metrics. There's no structured way to measure real contribution impact."
  },
  {
    title: "No Portable Reputation",
    description: "Contributors cannot carry reputation across ecosystems. Performance disappears after every campaign."
  },
  {
    title: "No Contribution Infrastructure",
    description: "Protocols depend on social participation to grow — threads, raids, content, amplification — yet none of it is structured."
  },
  {
    title: "Fragmented Data",
    description: "On-chain and off-chain social activity exist in silos with no unified intelligence layer."
  },
  {
    title: "Assumptions Over Evidence",
    description: "The result is a system driven by assumptions instead of evidence."
  },
];

const Problem = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            Web3 Runs on Contributors
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            But contribution has no infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="glass-card rounded-xl p-6 hover:border-primary/20 transition-all duration-300"
            >
              <h3 className="text-base font-medium mb-2 text-foreground">
                {problem.title}
              </h3>
              <p className="text-sm text-muted-foreground">
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
