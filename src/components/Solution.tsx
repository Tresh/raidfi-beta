import { ArrowRight } from "lucide-react";

const Solution = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
              The Solution
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              RaidFi introduces a
              decentralized engagement economy where social actions are tracked,
              analyzed by AI, and rewarded based on real value.
            </p>
          </div>

          {/* Flow diagram */}
          <div className="grid md:grid-cols-4 gap-4 mb-16">
            {[
              { label: "Project", desc: "Creates raid pool" },
              { label: "Raiders", desc: "Engage with content" },
              { label: "AI", desc: "Scores quality" },
              { label: "Rewards", desc: "Distributed fairly" },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="glass-card rounded-xl p-5 text-center hover:glow-cyan transition-all duration-500 group">
                  <p className="text-primary text-xs font-medium mb-1 uppercase tracking-wider">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-primary/50" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Key benefits */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Transparent Rankings",
                desc: "Every contributor is ranked based on AI-evaluated engagement quality, not just volume.",
              },
              {
                title: "Fair Distribution",
                desc: "Rewards flow to those who create real impact, eliminating spam and low-effort gaming.",
              },
              {
                title: "Measurable ROI",
                desc: "Projects get clear metrics on their social campaigns with actionable insights.",
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="glass-card rounded-xl p-6 hover:border-primary/20 transition-all duration-300 group"
              >
                <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
