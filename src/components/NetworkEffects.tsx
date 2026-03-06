import { motion } from "framer-motion";

const effects = [
  { metric: "More Contributors", detail: "Higher data density, more accurate reputation scores" },
  { metric: "More Projects", detail: "Cross-project analytics reveal patterns invisible in isolation" },
  { metric: "Better Data", detail: "Improved scoring drives higher-quality participation" },
  { metric: "Stronger Network", detail: "Each participant adds exponential value to the intelligence layer" },
];

const NetworkEffects = () => {
  return (
    <section className="py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-medium text-primary mb-4 tracking-widest uppercase">
                Network Effects
              </p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-[1.1]">
                Every participant makes the system smarter.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-light">
                RaidFi's intelligence compounds. More data means better scoring, which drives higher-quality participation in a self-reinforcing loop.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden">
              {effects.map((effect, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-card p-7 group hover:bg-background transition-colors duration-300"
                >
                  <h3 className="text-sm font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {effect.metric}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {effect.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NetworkEffects;
