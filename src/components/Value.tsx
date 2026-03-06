import { motion } from "framer-motion";
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
    <section id="value" className="py-32 bg-card">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <p className="text-xs font-medium text-primary mb-4 tracking-widest uppercase">Value</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-5 text-foreground">
              A New Infrastructure Layer
            </h2>
            <p className="text-lg text-muted-foreground font-light">For contributor economies</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
            {columns.map((col, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-background p-10"
              >
                <h3 className="text-lg font-semibold mb-1 text-foreground">{col.title}</h3>
                <p className="text-sm text-muted-foreground mb-8">{col.subtitle}</p>
                <div className="space-y-4">
                  {col.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Value;
