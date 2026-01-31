const steps = [
  {
    step: "01",
    title: "Create Raid Pool",
    description: "Projects define target content, accepted actions, rewards, and participation rules"
  },
  {
    step: "02",
    title: "Raider Participation",
    description: "Raiders engage through comments, retweets, likes, bookmarks, and shares"
  },
  {
    step: "03",
    title: "AI Scoring",
    description: "AI evaluates relevance, quality, sentiment, authenticity, and spam detection"
  },
  {
    step: "04",
    title: "Rank & Reward",
    description: "Contributors are ranked on leaderboards and rewards distributed by impact"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            How Swipht Works
          </h2>
          <p className="text-muted-foreground">
            A transparent four-step process that turns engagement into measurable value
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="glass-card rounded-xl p-6 hover:border-primary/20 transition-all duration-300 group">
              <p className="text-4xl font-semibold text-primary mb-4 group-hover:glow-cyan transition-all">{step.step}</p>
              <h3 className="text-base font-medium mb-2 text-foreground group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
