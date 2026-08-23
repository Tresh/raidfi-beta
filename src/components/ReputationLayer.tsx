import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const behavioralFactors = [
  "Consistency",
  "Longevity",
  "Cross-platform activity",
  "Contribution quality",
  "Participation history",
];

const notFactors = [
  "It is not a token.",
  "It is not something you buy.",
  "It is not simply a leaderboard position.",
];

const ReputationLayer = () => {
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
              THE REPUTATION LAYER
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Reputation should compound.
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
              Today, contributor credibility is often trapped inside individual communities. RaidFi is building a reputation layer where contribution history can persist across ecosystems.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-background p-8 rounded-xl border border-border"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Reputation is based on behavioral history such as:
              </h3>
              <div className="space-y-3">
                {behavioralFactors.map((factor, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm text-foreground/90 font-medium">{factor}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-background p-8 rounded-xl border border-border flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  What reputation is not:
                </h3>
                <div className="space-y-3 mb-6">
                  {notFactors.map((factor, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                        <X className="w-3 h-3" />
                      </div>
                      <span className="text-sm text-muted-foreground">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm font-medium text-foreground/90 border-t border-border pt-4">
                It is a structured record of contribution built over time.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReputationLayer;
