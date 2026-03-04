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
              RaidFi is a social data engine, reputation graph, and performance
              analytics layer — powering contributor intelligence across Web3.
              Data and reputation come first. Campaigns are an optional activation layer.
            </p>
          </div>

          {/* Flow diagram */}
          <div className="grid md:grid-cols-4 gap-4 mb-16">
            {[
              { label: "Track", desc: "Capture contributions across platforms and chains" },
              { label: "Analyze", desc: "Score quality, reach, consistency, and influence" },
              { label: "Rank", desc: "Build persistent, portable reputation profiles" },
              { label: "Unlock", desc: "Gate access and surface structured intelligence" },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="glass-card rounded-xl p-5 text-center hover:border-primary/20 transition-all duration-300">
                  <p className="text-primary text-xs font-medium mb-1 uppercase tracking-wider">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="font-medium text-foreground">{item.label}</p>
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

          {/* Key benefits with numbers */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Verified Contribution Tracking",
                stat: "100%",
                statLabel: "of contributions tracked",
                desc: "Every contribution is captured, verified, and structured — creating a trustless record of social impact across platforms.",
              },
              {
                title: "Persistent Reputation",
                stat: "∞",
                statLabel: "cross-campaign credibility",
                desc: "Contributor reputation compounds over time and carries across projects, building long-term credibility and access.",
              },
              {
                title: "Structured Intelligence",
                stat: "Real-time",
                statLabel: "performance analytics",
                desc: "Projects receive structured, actionable analytics on contributor performance — measurable data, not assumptions.",
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="glass-card rounded-xl p-6 hover:border-primary/20 transition-all duration-300"
              >
                <p className="text-2xl font-semibold text-primary mb-0.5">{benefit.stat}</p>
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">{benefit.statLabel}</p>
                <h3 className="font-medium text-foreground mb-2">
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
