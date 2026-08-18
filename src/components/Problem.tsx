import { motion } from "framer-motion";

const problems = [
  {
    number: "01",
    title: "You post, then it disappears",
    description:
      "You write the threads, make the videos, bring people in. A month later there's nothing that proves any of it was you.",
  },
  {
    number: "02",
    title: "The loudest get paid, not the best",
    description:
      "With no real data, rewards go to whoever spams the most or shouts loudest in the group chat.",
  },
  {
    number: "03",
    title: "Your track record doesn't travel",
    description:
      "Grind six months for one project, join the next one, and you're a stranger starting from zero again.",
  },
  {
    number: "04",
    title: "Teams can't tell what worked",
    description:
      "Projects see follower counts and vibes. They can't tell which person actually brought real users through the door.",
  },
  {
    number: "05",
    title: "So everyone just guesses",
    description:
      "Budgets, rewards and roles get handed out on gut feeling instead of evidence. Both sides lose.",
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
