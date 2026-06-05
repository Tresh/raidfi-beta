import { motion } from "framer-motion";

const problems = [
  {
    number: "01",
    title: "Surface Metrics",
    description: "Projects rely on surface metrics. There's no structured way to measure real contribution impact.",
  },
  {
    number: "02",
    title: "No Portable Reputation",
    description: "Contributors cannot carry reputation across ecosystems. Performance disappears after every campaign.",
  },
  {
    number: "03",
    title: "No Contribution Infrastructure",
    description: "Protocols depend on social participation to grow, yet none of it is structured or measurable.",
  },
  {
    number: "04",
    title: "Fragmented Data",
    description: "On-chain and off-chain social activity exist in silos with no unified intelligence layer.",
  },
  {
    number: "05",
    title: "Assumptions Over Evidence",
    description: "The result is a system driven by assumptions instead of evidence.",
  },
];

const Problem = () => {
  return (
    <section className="py-32 relative">
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
                  The Problem
                </p>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-[1.1]">
                  Web3 runs on contributors.
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed font-light">
                  But contribution has no infrastructure. No measurement. No portability. No accountability.
                </p>
              </motion.div>
            </div>

            {/* Right scrolling column */}
            <div className="space-y-6">
              {problems.map((problem, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group p-6 rounded-xl border border-border bg-card hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex items-start gap-5">
                    <span className="text-xs font-mono text-muted-foreground/70 mt-1 shrink-0">
                      {problem.number}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold mb-1.5 text-foreground group-hover:text-primary transition-colors">
                        {problem.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {problem.description}
                      </p>
                    </div>
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

export default Problem;
