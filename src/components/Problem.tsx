const problems = [
  {
    title: "No Contributor Identity",
    description: "There is no unified, portable identity for social contributors across Web3 campaigns and communities."
  },
  {
    title: "No Structured Analytics",
    description: "Projects lack measurable data on social campaign performance, contributor quality, and engagement efficiency."
  },
  {
    title: "Reputation Resets Every Campaign",
    description: "Contributor performance disappears after each campaign, no long-term credibility, no compounding value."
  },
  {
    title: "Fragmented Social Data",
    description: "On-chain and off-chain social contributions exist in silos with no unified intelligence layer."
  },
  {
    title: "Assumptions Over Evidence",
    description: "Projects select contributors and allocate resources without structured data or verified performance history."
  },
];

const Problem = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            The Gap in Web3
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Contributor economies are growing. Community-driven campaigns are scaling.
            Capital is flowing into social activation. But the intelligence layer is missing,
            contributor value goes untracked, unverified, and unowned.
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
