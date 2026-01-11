import { ArrowDown, Brain, MessageSquare, Target, Trophy } from "lucide-react";

const steps = [
  {
    icon: Target,
    title: "Create Raid Pool",
    description: "Projects define target content, accepted actions, rewards, and participation rules"
  },
  {
    icon: MessageSquare,
    title: "Raider Participation",
    description: "Raiders engage through comments, retweets, likes, bookmarks, and shares"
  },
  {
    icon: Brain,
    title: "AI Scoring",
    description: "AI evaluates relevance, quality, sentiment, authenticity, and spam detection"
  },
  {
    icon: Trophy,
    title: "Rank & Reward",
    description: "Contributors are ranked on leaderboards and rewards distributed by impact"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            How <span className="text-gradient-primary">Swipht</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A transparent four-step process that turns engagement into measurable value
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex items-start gap-8 mb-8">
                {/* Step number and icon */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/30 relative z-10">
                    <step.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-px h-16 bg-gradient-to-b from-primary/50 to-transparent mt-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 glass-card rounded-xl p-6 mt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-primary">Step {index + 1}</span>
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-2 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
