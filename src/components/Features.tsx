import { motion } from "framer-motion";
import {
  Shield, BarChart3, Users, Layers,
  LineChart, Lock, Zap, ArrowUpRight
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "A score that's yours",
    description: "Every approved contribution adds XP to one profile that follows you from project to project.",
  },
  {
    icon: Layers,
    title: "All your work in one place",
    description: "Posts on X, tasks, referrals and on-chain activity counted together instead of scattered everywhere.",
  },
  {
    icon: Users,
    title: "Rankings that mean something",
    description: "Leaderboards built from checked contributions, so the people actually doing the work are visible.",
  },
  {
    icon: BarChart3,
    title: "Tasks with the reward shown upfront",
    description: "Projects post what they need and what it pays. You do it, submit it, and get credited automatically.",
  },
  {
    icon: LineChart,
    title: "Dashboards for project teams",
    description: "See who brings reach, who brings real users, and what a campaign actually returned before you spend again.",
  },
  {
    icon: Lock,
    title: "Access earned by track record",
    description: "Projects can open paid campaigns and whitelists only to contributors who have proven they deliver.",
  },
  {
    icon: Zap,
    title: "Quality beats spam",
    description: "Scoring weighs reach, engagement and originality, so twenty copy-paste replies don't outrank one real thread.",
  },
  {
    icon: ArrowUpRight,
    title: "Take your record with you",
    description: "Export your contribution history or plug it into other tools, DAOs and communities you're part of.",
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
