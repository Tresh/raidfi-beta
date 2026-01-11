import { AlertTriangle, Ban, DollarSign, TrendingDown, Users, Zap } from "lucide-react";

const problems = [
  {
    icon: AlertTriangle,
    title: "Unstructured Chaos",
    description: "Raiding and shilling are mostly unstructured with no way to measure real impact"
  },
  {
    icon: TrendingDown,
    title: "Low Quality Spam",
    description: "Engagement quality is often low and flooded with spam-heavy interactions"
  },
  {
    icon: DollarSign,
    title: "Unfair Compensation",
    description: "Raiders are underpaid, unrewarded, or exploited for their efforts"
  },
  {
    icon: Users,
    title: "No Differentiation",
    description: "High-quality shillers are treated the same as low-effort spammers"
  },
  {
    icon: Ban,
    title: "Wasted Resources",
    description: "Projects waste resources on ineffective campaigns with no ROI tracking"
  },
  {
    icon: Zap,
    title: "Missing Infrastructure",
    description: "No standardized system exists for measuring social contribution value"
  }
];

const Problem = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            The <span className="text-destructive">Problem</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            In today's Web3 ecosystem, social growth is critical—yet deeply flawed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <div 
              key={index}
              className="glass-card rounded-xl p-6 border-destructive/10 hover:border-destructive/30 transition-all duration-300 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4 group-hover:bg-destructive/20 transition-colors">
                <problem.icon className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2 text-foreground">
                {problem.title}
              </h3>
              <p className="text-muted-foreground text-sm">
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
