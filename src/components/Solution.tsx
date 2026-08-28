import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    label: "1. Connect",
    desc: "Link the accounts you already use — X, Discord, Telegram — so your activity can be read in one place.",
  },
  {
    label: "2. Track",
    desc: "RaidFi collects your activity and normalises it into contribution events with context, not just counts.",
  },
  {
    label: "3. Understand",
    desc: "Signals like consistency, quality and reach turn raw activity into insight you and projects can read.",
  },
  {
    label: "4. Build reputation",
    desc: "Your contribution history compounds into a persistent, explainable reputation that follows you.",
  },
];

const Solution = () => {
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
            <p className="text-xs font-medium text-primary mb-4 tracking-widest uppercase">How it works</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-5 text-foreground">
              From activity to reputation
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto font-light text-lg">
              No spreadsheets, no screenshots, no guessing who actually showed up.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-background p-8 flex flex-col relative group"
              >
                <h3 className="text-base font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {item.label}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {item.desc}
                </p>
                {index < 3 && (
                  <div className="hidden md:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
