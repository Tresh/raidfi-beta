import { motion } from "framer-motion";

const problems = [
  {
    number: "01",
    title: "Likes are not contribution",
    description:
      "Impressions, follows and reply counts say something happened. They don't say anything about value.",
  },
  {
    number: "02",
    title: "Contribution is scattered",
    description:
      "Work happens on X, in Discord, in Telegram and in calls. Nothing joins it into one readable picture.",
  },
  {
    number: "03",
    title: "Track records don't travel",
    description:
      "Six months of real contribution ends when a campaign ends. In the next community you start as a stranger.",
  },
  {
    number: "04",
    title: "Teams can't see who matters",
    description:
      "Projects can't tell consistent contributors from short bursts of noise, or genuine reach from farmed activity.",
  },
  {
    number: "05",
    title: "So decisions are guesses",
    description:
      "Roles, budgets and trust get handed out on vibes and screenshots instead of evidence.",
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
                  The problem
                </p>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-[1.1]">
                  Crypto runs on people who post.
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed font-light">
                  And right now, none of that work gets recorded, measured, or properly paid.
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
