import { motion } from "framer-motion";

const RaidPool = () => {
  return (
    <section className="py-24 md:py-32 border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-2xl p-8 md:p-12 space-y-6"
          >
            <div>
              <p className="text-xs font-medium text-primary mb-3 tracking-widest uppercase">
                RAID POOL
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Structured campaigns, built on contribution data.
              </h2>
            </div>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light">
              Raid Pool is RaidFi's optional campaign layer. Projects can create structured contribution campaigns, define objectives and track participation.
            </p>

            <div className="grid md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-xl bg-background border border-border space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Where platform rules allow rewards:
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Verified contribution can be used within campaign reward systems.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-background border border-border space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Where platform rules do not allow rewards:
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Contribution can still contribute to analytics and reputation.
                </p>
              </div>
            </div>

            <p className="text-sm font-medium text-foreground/90 pt-4 border-t border-border">
              Raid Pool is not the foundation of RaidFi. The foundation is contribution intelligence and reputation.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default RaidPool;
