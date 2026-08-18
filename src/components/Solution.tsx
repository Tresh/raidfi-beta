import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    label: "1. Do the work",
    desc: "Post about a project on X, finish a task, or bring people in. Nothing new — this is what you already do.",
  },
  {
    label: "2. Drop the link",
    desc: "Paste the link to your post on RaidFi. We confirm the account is yours and read what you actually said.",
  },
  {
    label: "3. Get scored",
    desc: "We look at reach, engagement and whether it's real work or copy-paste, then award XP for it.",
  },
  {
    label: "4. Build your record",
    desc: "Your XP, rank and history live on one profile that follows you to every project on RaidFi.",
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
              Four steps, start to paid
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto font-light text-lg">
              No spreadsheets, no screenshots, no begging a mod in DMs to count your posts.
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
