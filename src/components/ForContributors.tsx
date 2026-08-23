import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  {
    title: "Your contribution, organized",
    description: "Bring relevant contribution activity into one place instead of leaving it scattered across platforms and communities.",
  },
  {
    title: "A reputation built over time",
    description: "Your reputation is based on behavioral history, not a single campaign or one spike of activity.",
  },
  {
    title: "See how you contribute",
    description: "Understand your contribution patterns, activity trends and reputation signals.",
  },
  {
    title: "Carry your history forward",
    description: "Your contribution record is designed to become a persistent part of your identity across ecosystems.",
  },
  {
    title: "Be more than a username",
    description: "Give projects something better than a follower count to evaluate: a history of contribution.",
  },
];

const ForContributors = () => {
  return (
    <section id="for-contributors" className="py-24 md:py-32 bg-card border-t border-border/50">
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
              FOR CONTRIBUTORS
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Build a reputation around the work you already do.
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
              Your contribution shouldn't disappear when a campaign ends. RaidFi gives contributors a structured place for their contribution history and reputation to compound over time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-background border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <h3 className="text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-8">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button size="lg" asChild className="h-11 px-7 text-sm">
              <a href="/waitlist" className="group">
                Start Building Your Reputation
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ForContributors;
