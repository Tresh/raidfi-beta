import { motion } from "framer-motion";

const platforms = [
  {
    name: "X",
    desc: "Contribution intelligence + reputation",
  },
  {
    name: "Discord",
    desc: "Community participation and behavioral signals",
  },
  {
    name: "Telegram",
    desc: "Community participation and behavioral signals",
  },
  {
    name: "More platforms",
    desc: "As integrations become available and their rules allow it.",
  },
];

const BuiltForWeb3 = () => {
  return (
    <section className="py-24 md:py-32 bg-card border-t border-border/50">
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
              BUILT FOR THE WEB3 ECOSYSTEM
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Contribution happens everywhere.
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed mb-4">
              Web3 communities don't live on one platform. Contribution happens across social networks, community platforms and ecosystems.
            </p>
            <p className="text-sm font-medium text-foreground/80 max-w-xl mx-auto">
              RaidFi is designed around a multi-platform contribution model so that contributor history can become bigger than any single platform.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map((p, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-background border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-foreground mb-2">{p.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuiltForWeb3;
