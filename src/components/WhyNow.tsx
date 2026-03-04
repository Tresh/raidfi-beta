const WhyNow = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            Why Now
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The conditions for a social intelligence layer have never been stronger
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              title: "Contributor Economies Are Scaling",
              desc: "Web3 projects increasingly rely on community-driven social campaigns. The volume of contributors, contributions, and capital flowing into social activation is growing — but the infrastructure to measure and manage it doesn't exist yet.",
            },
            {
              title: "Intelligence Is the Missing Layer",
              desc: "Financial infrastructure exists. Social infrastructure doesn't. Projects are deploying capital into social campaigns without structured data, verified performance history, or actionable analytics. The gap is widening.",
            },
            {
              title: "Reputation Becomes the Moat",
              desc: "As contributor data compounds, reputation becomes more accurate, access becomes more meaningful, and the intelligence layer becomes harder to replicate. Early adoption creates a compounding advantage for projects and contributors alike.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="glass-card rounded-xl p-6 hover:border-primary/20 transition-all duration-300"
            >
              <h3 className="text-base font-medium mb-2 text-foreground">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyNow;
