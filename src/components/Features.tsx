import { BarChart3, Brain, MessageSquareText, Shield, Sparkles, Trophy, Users, Wallet } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Raid Pool Creation",
    description: "Projects easily create and manage structured raid campaigns with customizable rules and rewards"
  },
  {
    icon: Brain,
    title: "AI-Ranked Engagement",
    description: "Advanced AI analyzes every interaction for relevance, quality, and authenticity"
  },
  {
    icon: MessageSquareText,
    title: "Smart Comments",
    description: "AI-assisted commenting suggestions that improve quality while maintaining authenticity"
  },
  {
    icon: Shield,
    title: "Anti-Spam Filtering",
    description: "Sophisticated detection eliminates low-effort spam and bot activity"
  },
  {
    icon: Trophy,
    title: "Transparent Leaderboards",
    description: "Real-time rankings based on engagement volume and quality scores"
  },
  {
    icon: Users,
    title: "Reputation Profiles",
    description: "Build long-term credibility through consistent quality contributions"
  },
  {
    icon: Sparkles,
    title: "Extended Shilling",
    description: "Recognition for organic mentions and sustained visibility beyond raids"
  },
  {
    icon: Wallet,
    title: "Flexible Rewards",
    description: "Multi-token support including native, project, and stable-value assets"
  }
];

import { Target } from "lucide-react";

const Features = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Key <span className="text-gradient-primary">Features</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to transform social engagement into measurable, rewarded contributions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group hover:scale-105"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
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
