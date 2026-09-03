import { motion } from "framer-motion";
import {
  Shield, BarChart3, Users, Layers,
  LineChart, Lock, Zap, ArrowUpRight
} from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Multi-platform tracking",
    description: "Activity from X, Discord and Telegram normalised into one consistent contribution model.",
  },
  {
    icon: Shield,
    title: "Contribution events, not counts",
    description: "Every event keeps its source, type, timestamp and context - raw data stays separate from insight.",
  },
  {
    icon: Zap,
    title: "Behavioural signals",
    description: "Consistency, longevity, quality-weighted reach and cross-platform presence, measured over time.",
  },
  {
    icon: BarChart3,
    title: "A reputation you can explain",
    description: "Reputation is a long-term behavioural record with visible factors. Not a token, not a balance.",
  },
  {
    icon: LineChart,
    title: "Analytics for contributors",
    description: "See how your contribution develops across platforms, and where consistency is building or slipping.",
  },
  {
    icon: Users,
    title: "Ecosystem intelligence for projects",
    description: "Who contributes, who is emerging, who has gone quiet, and where community health is trending.",
  },
  {
    icon: Lock,
    title: "Honest data states",
    description: "Syncing, synced, failed or disconnected are shown as they are. A failed sync never reads as zero.",
  },
  {
    icon: ArrowUpRight,
    title: "Portable history",
    description: "Your contribution record belongs to you and carries across the communities you join.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <p className="text-xs font-medium text-primary mb-4 tracking-widest uppercase">What you get</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-5 text-foreground">
              Everything RaidFi does
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-card p-7 group hover:bg-background transition-colors duration-300"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
