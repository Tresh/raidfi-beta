import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    label: "Connect your contribution",
    desc: "Connect the platforms where you participate. RaidFi can work across social and community platforms such as X, Discord and Telegram, depending on available integrations and platform rules.",
  },
  {
    number: "02",
    label: "Build your contribution history",
    desc: "RaidFi organizes relevant contribution activity into a structured record. Instead of scattered posts and disconnected activity, your contribution starts becoming a longitudinal history.",
  },
  {
    number: "03",
    label: "Understand the behavior",
    desc: "RaidFi analyzes patterns such as consistency, longevity, amplification, engagement depth and cross-platform activity. The goal isn't simply to measure volume. It's to understand contribution.",
  },
  {
    number: "04",
    label: "Build reputation",
    desc: "Your contribution history feeds into a reputation model designed around sustained behavior rather than short-term activity. Over time, your history becomes a stronger representation of your credibility as a contributor.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-card border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-xs font-medium text-primary mb-4 tracking-widest uppercase">
              HOW RAIDFI WORKS
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-5 text-foreground">
              From activity to intelligence.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-light text-base md:text-lg leading-relaxed">
              RaidFi doesn't just count activity. It structures contribution data and looks for the behavioral patterns behind it.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-background p-6 rounded-xl border border-border flex flex-col justify-between group hover:border-primary/30 transition-all duration-300"
              >
                <div>
                  <span className="text-xs font-mono font-semibold text-primary/80 mb-3 block">
                    {item.number}
                  </span>
                  <h3 className="text-base font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
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

export default HowItWorks;
