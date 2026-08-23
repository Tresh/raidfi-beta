import { motion } from "framer-motion";

const problems = [
  {
    number: "01",
    title: "Activity isn't contribution",
    description:
      "A high post count doesn't tell you whether someone actually created value. Likes, impressions and follower counts can be inflated, gamed or completely disconnected from meaningful contribution.",
  },
  {
    number: "02",
    title: "Contribution gets lost",
    description:
      "A contributor can spend months supporting an ecosystem and have little structured record of what they actually did. When the campaign ends, the history often disappears with it.",
  },
  {
    number: "03",
    title: "Reputation doesn't travel",
    description:
      "A contributor can build a strong track record in one ecosystem and still have to prove themselves from scratch somewhere else. There is no shared layer for contributor history.",
  },
  {
    number: "04",
    title: "Projects lack the full picture",
    description:
      "Projects can see engagement numbers. What they often cannot see is the behavior behind those numbers: Who is consistent? Who contributes meaningfully? Who has been there over time? Who is actually helping the ecosystem?",
  },
  {
    number: "05",
    title: "Decisions become guesswork",
    description:
      "When contribution isn't structured, rewards, opportunities and contributor decisions are made from incomplete information. RaidFi is built to replace that guesswork with contribution intelligence.",
  },
];

const Problem = () => {
  return (
    <section className="py-24 md:py-32 relative border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left sticky column */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-xs font-medium text-primary mb-4 tracking-widest uppercase">
                  THE PROBLEM
                </p>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground leading-[1.12]">
                  Web3 runs on contribution. But contribution is still mostly invisible.
                </h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light">
                  People educate users, amplify protocols, support launches, create content, participate in communities and help ecosystems grow. But most of that contribution is scattered across different platforms and measured with surface-level metrics.
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
                    <span className="text-xs font-mono text-primary/80 mt-1 shrink-0 font-semibold">
                      {problem.number}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
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
