const WhyNow = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            Contribution Is Becoming Infrastructure
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Web3 growth increasingly depends on community-driven distribution
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              title: "The Missing Layer",
              desc: "The systems to measure, analyze, and understand contributor impact have never existed. RaidFi introduces this missing layer.",
            },
            {
              title: "Reputation Becomes Meaningful",
              desc: "As contributor data compounds, reputation becomes more accurate, access becomes merit-based, and social growth becomes measurable.",
            },
            {
              title: "Compounding Advantage",
              desc: "Early adoption creates a compounding advantage. The more contributors and projects participate, the richer and more valuable the intelligence becomes.",
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
