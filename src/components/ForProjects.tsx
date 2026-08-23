import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const items = [
  {
    title: "Understand your contributors",
    description: "See who is consistently contributing, who is emerging and how contribution is distributed across your community.",
  },
  {
    title: "Look beyond vanity metrics",
    description: "Follower counts and engagement numbers are signals, not the complete picture. RaidFi focuses on behavioral patterns and contribution history.",
  },
  {
    title: "Measure contribution over time",
    description: "Understand whether contributor activity is growing, declining, or becoming concentrated around a small group.",
  },
  {
    title: "Identify meaningful contributors",
    description: "Find contributors whose history demonstrates sustained participation and useful contribution.",
  },
  {
    title: "Make better decisions",
    description: "Use structured contributor intelligence to inform opportunities, campaigns and ecosystem decisions.",
  },
];

const ForProjects = () => {
  return (
    <section id="for-projects" className="py-24 md:py-32 border-t border-border/50">
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
              FOR PROJECTS
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Stop measuring your community by surface metrics.
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
              RaidFi gives projects a clearer view of the people contributing to their ecosystem.
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
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300"
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
            <Button size="lg" variant="outline" asChild className="h-11 px-7 text-sm">
              <a href="/project-request">
                Bring Your Project to RaidFi
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ForProjects;
