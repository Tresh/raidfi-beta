const problems = [
  {
    title: "Unstructured Chaos",
    description: "Raiding and shilling are mostly unstructured with no way to measure real impact"
  },
  {
    title: "Low Quality Spam",
    description: "Engagement quality is often low and flooded with spam-heavy interactions"
  },
  {
    title: "Unfair Compensation",
    description: "Raiders are underpaid, unrewarded, or exploited for their efforts"
  },
  {
    title: "No Differentiation",
    description: "High-quality shillers are treated the same as low-effort spammers"
  },
  {
    title: "Wasted Resources",
    description: "Projects waste resources on ineffective campaigns with no ROI tracking"
  },
  {
    title: "Missing Infrastructure",
    description: "No standardized system exists for measuring social contribution value"
  }
];

const Problem = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            The Problem
          </h2>
          <p className="text-muted-foreground">
            In today's Web3 ecosystem, social growth is critical—yet deeply flawed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <div 
              key={index}
              className="p-6 border border-border rounded-lg"
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
