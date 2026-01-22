import { CheckCircle2 } from "lucide-react";

const Value = () => {
  return (
    <section id="value" className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            Value Proposition
          </h2>
          <p className="text-muted-foreground">
            Swipht creates value for both projects and contributors
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="border border-border rounded-lg p-8">
            <h3 className="text-xl font-medium mb-2 text-foreground">For Projects</h3>
            <p className="text-sm text-muted-foreground mb-6">Scale your social growth</p>

            <div className="space-y-3">
              {[
                "Higher quality engagement with measurable ROI",
                "Reduced spam risk through AI filtering",
                "Transparent contributor performance metrics",
                "Scalable social growth infrastructure"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border rounded-lg p-8">
            <h3 className="text-xl font-medium mb-2 text-foreground">For Raiders</h3>
            <p className="text-sm text-muted-foreground mb-6">Get rewarded for quality</p>

            <div className="space-y-3">
              {[
                "Fair and transparent reward distribution",
                "Reputation-based rankings that matter",
                "Recognition for quality contributions",
                "Long-term incentive alignment"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Value;
