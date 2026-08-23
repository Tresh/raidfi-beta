import { motion } from "framer-motion";
import { Clock, Calendar, Sparkles, Network, History } from "lucide-react";

const measures = [
  {
    icon: Clock,
    title: "Consistency",
    description: "How regularly do you contribute over time?",
  },
  {
    icon: Calendar,
    title: "Longevity",
    description: "Have you demonstrated sustained contribution rather than a short burst of activity?",
  },
  {
    icon: Sparkles,
    title: "Quality & Depth",
    description: "Does your activity show meaningful participation rather than repetitive volume?",
  },
  {
    icon: Network,
    title: "Cross-Platform Contribution",
    description: "Does your contribution extend across the communities where you participate?",
  },
  {
    icon: History,
    title: "Contribution History",
    description: "What does your behavior over time tell us about you?",
  },
];

const WhatItMeasures = () => {
  return (
    <section className="py-24 md:py-32 border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-xs font-medium text-primary mb-4 tracking-widest uppercase">
              WHAT RAIDFI MEASURES
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Not just how much you do. How you contribute.
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto font-light">
              RaidFi looks beyond surface-level activity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {measures.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold mb-2 text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm font-medium text-muted-foreground"
          >
            These signals work together to create a more useful picture of contribution.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default WhatItMeasures;
