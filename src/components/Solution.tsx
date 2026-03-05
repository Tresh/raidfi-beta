import { ArrowRight } from "lucide-react";

const Solution = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
              Turning Social Activity Into Intelligence
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              RaidFi transforms social participation into structured data and persistent reputation. Every contribution becomes measurable. Every contributor builds a long-term performance record.
            </p>
          </div>

          {/* Flow diagram */}
          <div className="grid md:grid-cols-4 gap-4 mb-16">
            {[
              { label: "Capture", desc: "Monitor social participation across platforms and on-chain interactions" },
              { label: "Analyze", desc: "Evaluate contribution quality, reach, consistency, and influence" },
              { label: "Build Reputation", desc: "Feed performance into a persistent reputation graph that compounds over time" },
              { label: "Unlock Access", desc: "Give projects structured analytics for data-driven decisions" },
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

        </div>
      </div>
    </section>
  );
};

export default Solution;
