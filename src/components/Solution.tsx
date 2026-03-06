import { ArrowRight } from "lucide-react";

const steps = [
  { label: "Capture", desc: "Monitor social participation across platforms and on-chain interactions" },
  { label: "Analyze", desc: "Evaluate contribution quality, reach, consistency, and influence" },
  { label: "Build Reputation", desc: "Feed performance into a persistent reputation graph that compounds over time" },
  { label: "Unlock Access", desc: "Give projects structured analytics for data-driven decisions" },
];

const Solution = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary mb-3 tracking-wide uppercase">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              From Noise to Signal
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              RaidFi transforms social participation into structured data and persistent reputation.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-5">
            {steps.map((item, index) => (
              <div key={index} className="relative">
                <div className="rounded-xl p-6 bg-card border border-border hover:border-primary/30 transition-colors text-center h-full">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3">
                    {index + 1}
                  </span>
                  <p className="font-semibold text-foreground mb-1">{item.label}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
