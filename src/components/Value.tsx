import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const columns = [
  {
    title: "If you post",
    subtitle: "Turn your posting into proof",
    items: [
      "A permanent record of everything you've contributed",
      "XP and a rank that carry to every project on RaidFi",
      "Paid tasks and whitelists you actually qualify for",
      "Credit for good work, not just for posting a lot",
      "One profile you can show anyone, anytime",
    ],
  },
  {
    title: "If you run a project",
    subtitle: "Know who is really growing you",
    items: [
      "See which people drive real reach and real sign-ups",
      "Post tasks and track who finished them, without spreadsheets",
      "Reward based on results you can check",
      "Spot farmers before they eat your budget",
      "Know what a campaign returned before you fund the next one",
    ],
  },
  {
    title: "For everyone else",
    subtitle: "One shared standard",
    items: [
      "Scores that mean the same thing across communities",
      "History that survives after a campaign ends",
      "An honest read on how strong a community really is",
      "Less guessing, fewer wasted incentives",
    ],
  },
];

const Value = () => {
  return (
    <section id="value" className="py-32 bg-card">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <p className="text-xs font-medium text-primary mb-4 tracking-widest uppercase">Who it's for</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-5 text-foreground">
              Built for both sides
            </h2>
            <p className="text-lg text-muted-foreground font-light">
              Contributors get proof. Projects get clarity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
            {columns.map((col, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-background p-10"
              >
                <h3 className="text-lg font-semibold mb-1 text-foreground">{col.title}</h3>
                <p className="text-sm text-muted-foreground mb-8">{col.subtitle}</p>
                <div className="space-y-4">
                  {col.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Value;
