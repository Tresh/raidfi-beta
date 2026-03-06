import { motion } from "framer-motion";

const reasons = [
  {
    title: "Contributor Activity is Exploding",
    description: "Social participation in Web3 is at an all-time high, but there's no system to capture its value.",
  },
  {
    title: "Projects Need Accountability",
    description: "As budgets grow, projects need measurable ROI on community and contributor spend.",
  },
  {
    title: "Reputation is the Missing Primitive",
    description: "DeFi has liquidity protocols. NFTs have marketplaces. Contributors have nothing.",
  },
];

const WhyNow = () => {
  return (
    <section className="py-32 bg-card">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <p className="text-xs font-medium text-primary mb-4 tracking-widest uppercase">Timing</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-5 text-foreground">
              Why Now?
            </h2>
          </motion.div>

          <div className="space-y-px">
            {reasons.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group flex items-start gap-8 p-8 rounded-none first:rounded-t-2xl last:rounded-b-2xl bg-background border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors duration-300"
              >
                <span className="text-4xl font-bold text-primary/10 shrink-0 group-hover:text-primary/20 transition-colors">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {reason.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyNow;
