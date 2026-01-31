const features = [
  {
    title: "Raid Pool Creation",
    description: "Projects easily create and manage structured raid campaigns with customizable rules and rewards"
  },
  {
    title: "AI-Ranked Engagement",
    description: "Advanced AI analyzes every interaction for relevance, quality, and authenticity"
  },
  {
    title: "Smart Comments",
    description: "AI-assisted commenting suggestions that improve quality while maintaining authenticity"
  },
  {
    title: "Anti-Spam Filtering",
    description: "Sophisticated detection eliminates low-effort spam and bot activity"
  },
  {
    title: "Transparent Leaderboards",
    description: "Real-time rankings based on engagement volume and quality scores"
  },
  {
    title: "Reputation Profiles",
    description: "Build long-term credibility through consistent quality contributions"
  },
  {
    title: "Extended Shilling",
    description: "Recognition for organic mentions and sustained visibility beyond raids"
  },
  {
    title: "Flexible Rewards",
    description: "Multi-token support including native, project, and stable-value assets"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            Key Features
          </h2>
          <p className="text-muted-foreground">
            Everything you need to transform social engagement into measurable, rewarded contributions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-card rounded-xl p-5 hover:border-primary/20 hover:glow-cyan transition-all duration-500 group"
            >
              <h3 className="text-base font-medium mb-2 text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
