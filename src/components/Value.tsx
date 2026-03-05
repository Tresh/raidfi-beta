import { CheckCircle2 } from "lucide-react";

const Value = () => {
  return (
    <section id="value" className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            A New Infrastructure Layer
          </h2>
          <p className="text-muted-foreground">
            For contributor economies
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="border border-border rounded-lg p-8">
            <h3 className="text-xl font-medium mb-2 text-foreground">For Projects</h3>
            <p className="text-sm text-muted-foreground mb-6">Visibility into community impact</p>

            <div className="space-y-3">
              {[
                "Structured cross-platform social data",
                "Contributor performance analytics",
                "Engagement efficiency and reach metrics",
                "ROI tracking across on-chain and off-chain activity",
                "Data-driven campaign deployment",
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
            <p className="text-sm text-muted-foreground mb-6">Verifiable social capital</p>

            <div className="space-y-3">
              {[
                "Portable reputation built on measured performance",
                "Historical record of impact across projects",
                "Eligibility for gated opportunities",
                "Visibility based on consistent contribution quality",
                "Activity becomes long-term credibility",
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
            <p className="text-sm text-muted-foreground mb-6">Data-driven distribution infrastructure</p>

            <div className="space-y-3">
              {[
                "Standardized performance metrics across communities",
                "Persistent contributor analytics beyond single campaigns",
                "Visibility into community strength and influence",
                "Intelligence graph that compounds over time",
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
