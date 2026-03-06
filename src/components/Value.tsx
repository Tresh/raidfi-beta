import { CheckCircle2 } from "lucide-react";

const columns = [
  {
    title: "For Projects",
    subtitle: "Visibility into community impact",
    items: [
      "Structured cross-platform social data",
      "Contributor performance analytics",
      "Engagement efficiency and reach metrics",
      "ROI tracking across on-chain and off-chain activity",
      "Data-driven campaign deployment",
    ],
  },
  {
    title: "For Contributors",
    subtitle: "Verifiable social capital",
    items: [
      "Portable reputation built on measured performance",
      "Historical record of impact across projects",
      "Eligibility for gated opportunities",
      "Visibility based on consistent contribution quality",
      "Activity becomes long-term credibility",
    ],
  },
  {
    title: "For the Ecosystem",
    subtitle: "Data-driven distribution infrastructure",
    items: [
      "Standardized performance metrics across communities",
      "Persistent contributor analytics beyond single campaigns",
      "Visibility into community strength and influence",
      "Intelligence graph that compounds over time",
    ],
  },
];

const Value = () => {
  return (
    <section id="value" className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3 tracking-wide uppercase">Value</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            A New Infrastructure Layer
          </h2>
          <p className="text-muted-foreground">For contributor economies</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {columns.map((col, i) => (
            <div key={i} className="border border-border rounded-xl p-8 bg-card">
              <h3 className="text-lg font-semibold mb-1 text-foreground">{col.title}</h3>
              <p className="text-sm text-muted-foreground mb-6">{col.subtitle}</p>
              <div className="space-y-3">
                {col.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Value;
