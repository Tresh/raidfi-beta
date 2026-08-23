import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const flowSteps = [
  "Social Activity",
  "Contribution Data",
  "Behavioral Signals",
  "Contribution Intelligence",
  "Reputation",
];

const keyQuestions = [
  "“What kind of contribution did they make?”",
  "“Was it consistent?”",
  "“Did they sustain it?”",
  "“How does their behavior compare over time?”",
  "“What does their history tell us?”",
];

const ContributionIntelligence = () => {
  return (
    <section className="py-24 md:py-32 border-t border-border/50">
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
              CONTRIBUTION INTELLIGENCE
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Raw activity is data. Intelligence is what you can understand from it.
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side: Data flow */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-8 space-y-3"
            >
              {flowSteps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-full py-3 px-4 rounded-lg bg-background border border-border text-center font-medium text-sm text-foreground">
                    {step}
                  </div>
                  {idx < flowSteps.length - 1 && (
                    <ArrowDown className="w-4 h-4 text-primary my-1" />
                  )}
                </div>
              ))}
            </motion.div>

            {/* Right side: Beyond vanity impressions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/5">
                <p className="text-xs font-mono uppercase text-destructive font-semibold mb-1">
                  This allows RaidFi to move beyond:
                </p>
                <p className="text-lg font-semibold text-foreground">
                  «“This person got 10,000 impressions.”»
                </p>
              </div>

              <div className="p-6 rounded-xl border border-primary/20 bg-primary/5">
                <p className="text-xs font-mono uppercase text-primary font-semibold mb-3">
                  Toward questions that actually matter:
                </p>
                <div className="space-y-2">
                  {keyQuestions.map((q, i) => (
                    <p key={i} className="text-sm md:text-base font-medium text-foreground italic">
                      {q}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContributionIntelligence;
