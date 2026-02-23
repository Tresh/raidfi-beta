const problems = [
  {
    title: "No Contributor Identity",
    description: "There is no unified, portable identity for social contributors across Web3 campaigns"
  },
  {
    title: "No Reliable Analytics",
    description: "Projects lack structured data on social campaign performance and contributor quality"
  },
  {
    title: "Noise vs. Influence",
    description: "No system separates genuine influence from low-value engagement at scale"
  },
  {
    title: "Reputation Disappears",
    description: "Raid performance resets after every campaign — no long-term contributor credibility"
  },
  {
    title: "Fragmented Data",
    description: "On-chain and off-chain social contributions exist in silos with no unified view"
  },
  {
    title: "Guesswork Over Intelligence",
    description: "Projects select contributors and allocate resources without actionable social intelligence"
  }
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
            Web3 has financial infrastructure. It lacks social infrastructure.
            Contributor value goes untracked, unverified, and unowned. Projects have no way to measure community impact.
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
