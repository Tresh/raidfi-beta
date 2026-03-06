import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Capture",
    description: "RaidFi monitors social participation across supported platforms and on-chain interactions connected to Web3 communities.",
    items: ["Engagement behavior", "Mention velocity", "Influence spread", "Community growth patterns"],
  },
  {
    number: "02",
    title: "Analyze",
    description: "Behavioral signals are evaluated to measure contribution quality, reach efficiency, consistency, and influence.",
    items: ["Contribution quality", "Reach efficiency", "Consistency over time", "Influence depth"],
  },
  {
    number: "03",
    title: "Build Reputation",
    description: "Performance history feeds into a persistent reputation graph that compounds over time and travels with contributors.",
    items: ["Portable across ecosystems", "Reflects long-term credibility", "Differentiates signal from noise", "Builds compounding social capital"],
  },
  {
    number: "04",
    title: "Unlock Access",
    description: "Projects gain structured analytics on contributors and communities, enabling data-driven decisions instead of guesswork.",
    items: ["Contributor performance analytics", "Community strength metrics", "Influence mapping", "Data-backed decision support"],
  },
];

const HowItWorks = () => {
  return (
    <section className="py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left sticky column */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-xs font-medium text-primary mb-4 tracking-widest uppercase">
                  Deep Dive
                </p>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-[1.1]">
                  Four steps to verifiable contribution.
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed font-light">
                  Each layer builds on the last, creating a compounding intelligence system for the contributor economy.
                </p>
              </motion.div>
            </div>

            {/* Right scrolling column */}
            <div className="space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="p-8 rounded-2xl border border-border bg-card"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-mono text-primary tracking-wider bg-primary/5 px-2.5 py-1 rounded-full">
                      STEP {step.number}
                    </span>
                    <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {step.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {step.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
