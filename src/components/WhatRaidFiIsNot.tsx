import { motion } from "framer-motion";
import { X } from "lucide-react";

const notList = [
  "A marketing agency",
  "A social media automation tool",
  "An engagement farm",
  "A click farm",
  "A vanity-metrics dashboard",
  "A token farming protocol",
  "A pay-per-click network",
  "A system for bypassing platform rules",
];

const WhatRaidFiIsNot = () => {
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
              WHAT RAIDFI IS NOT
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Built for contribution, not manufactured engagement.
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto font-light">
              RaidFi is not:
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {notList.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="bg-background border border-border/80 rounded-xl p-4 flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                  <X className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center bg-background border border-border p-6 rounded-xl max-w-2xl mx-auto"
          >
            <p className="text-sm md:text-base font-medium text-foreground">
              RaidFi doesn't exist to create more meaningless activity.
            </p>
            <p className="text-sm md:text-base text-primary font-semibold mt-1">
              It exists to make meaningful contribution measurable.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhatRaidFiIsNot;
