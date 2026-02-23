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
            Reputation and access, not just rewards
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="border border-border rounded-lg p-8">
            <h3 className="text-xl font-medium mb-2 text-foreground">For Projects</h3>
            <p className="text-sm text-muted-foreground mb-6">Strategic social intelligence</p>

            <div className="space-y-3">
              {[
                "Access community social data without launching a campaign",
                "Performance-based raid team selection and vetting",
                "ROI visibility across on-chain and off-chain campaigns",
                "Launch raid pools when you're ready, not before"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border rounded-lg p-8">
            <h3 className="text-xl font-medium mb-2 text-foreground">For Community</h3>
            <p className="text-sm text-muted-foreground mb-6">Own your social reputation</p>

            <div className="space-y-3">
              {[
                "Portable reputation that persists across campaigns",
                "Access to higher-tier campaigns and opportunities",
                "Long-term contributor credibility and proof of impact",
                "Data-backed profile that speaks for your work"
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
