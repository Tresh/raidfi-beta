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
            Structured Data. Persistent Reputation. Intelligent Access.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="border border-border rounded-lg p-8">
            <h3 className="text-xl font-medium mb-2 text-foreground">For Projects</h3>
            <p className="text-sm text-muted-foreground mb-6">Social Intelligence You Can Act On</p>

            <div className="space-y-3">
              {[
                "Access structured cross-platform social data in one unified layer",
                "Analyze contributor performance using historical metrics",
                "Measure engagement efficiency, reach depth, and consistency",
                "Track ROI across on-chain and off-chain activity",
                "Deploy reward-backed campaigns when analytics justify activation",
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Allocate incentives based on evidence, not assumptions.
            </p>
          </div>

          <div className="border border-border rounded-lg p-8">
            <h3 className="text-xl font-medium mb-2 text-foreground">For Contributors</h3>
            <p className="text-sm text-muted-foreground mb-6">Build Verifiable Social Capital</p>

            <div className="space-y-3">
              {[
                "Create a portable reputation built on measured performance",
                "Maintain a historical record of impact across projects",
                "Increase eligibility for gated opportunities",
                "Gain visibility based on consistent contribution quality",
                "Turn activity into long-term credibility",
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Performance becomes your proof.
            </p>
          </div>

          <div className="border border-border rounded-lg p-8">
            <h3 className="text-xl font-medium mb-2 text-foreground">For the Ecosystem</h3>
            <p className="text-sm text-muted-foreground mb-6">A Unified Social Data & Reputation Layer</p>

            <div className="space-y-3">
              {[
                "Standardized performance metrics across communities",
                "Contributor analytics that persist beyond single campaigns",
                "Structured visibility into community strength and influence",
                "A growing intelligence graph that compounds over time",
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              More data in, more accurate the intelligence becomes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Value;
