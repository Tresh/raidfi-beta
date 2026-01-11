import { ArrowUpRight, Building2, CheckCircle2, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Value = () => {
  return (
    <section id="value" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Value <span className="text-gradient-primary">Proposition</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Swipht creates value for both projects and contributors
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* For Projects */}
          <div className="glass-card rounded-2xl p-8 border-primary/20 hover:border-primary/40 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Building2 className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-heading font-bold text-foreground">For Projects</h3>
                <p className="text-muted-foreground">Scale your social growth</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {[
                "Higher quality engagement with measurable ROI",
                "Reduced spam risk through AI filtering",
                "Transparent contributor performance metrics",
                "Scalable social growth infrastructure"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <Button variant="hero" className="w-full">
              Create Raid Pool
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>

          {/* For Raiders */}
          <div className="glass-card rounded-2xl p-8 border-accent/20 hover:border-accent/40 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-accent flex items-center justify-center">
                <User className="w-7 h-7 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-heading font-bold text-foreground">For Raiders</h3>
                <p className="text-muted-foreground">Get rewarded for quality</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {[
                "Fair and transparent reward distribution",
                "Reputation-based rankings that matter",
                "Recognition for quality contributions",
                "Long-term incentive alignment"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <Button variant="accent" className="w-full">
              Start Raiding
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Value;
