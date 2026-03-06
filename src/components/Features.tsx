import { motion } from "framer-motion";
import { 
  Shield, BarChart3, Users, Layers, 
  LineChart, Lock, Zap, ArrowUpRight 
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Persistent Contributor Reputation",
    description: "A reputation system built from verified performance data. Cross-project scoring and historical credibility tracking.",
  },
  {
    icon: Layers,
    title: "Cross-Platform Social Intelligence",
    description: "Aggregation across X, Farcaster, Telegram, and on-chain interactions — normalized into a single framework.",
  },
  {
    icon: Users,
    title: "Contributor & Team Analytics",
    description: "Individual performance history, team reputation, comparative analytics, and leaderboard intelligence.",
  },
  {
    icon: BarChart3,
    title: "Structured Campaign Infrastructure",
    description: "Campaign deployment with autonomous tracking, performance-weighted reward pools, and reputation impact.",
  },
  {
    icon: LineChart,
    title: "Intelligence Dashboards",
    description: "Social ROI metrics, community strength diagnostics, contributor segmentation, and growth forecasting.",
  },
  {
    icon: Lock,
    title: "Reputation-Based Access Control",
    description: "Gate campaigns by credibility score. Tiered access with verified contributor filtering.",
  },
  {
    icon: Zap,
    title: "Multi-Signal Influence Engine",
    description: "Scoring engine analyzing reach velocity, engagement depth, amplification patterns, and signal-to-noise ratios.",
  },
  {
    icon: ArrowUpRight,
    title: "Data Export & Integrations",
    description: "Exportable contributor intelligence, DAO tooling integration, and plug-in layer for partner ecosystems.",
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
            <p className="text-xs font-medium text-primary mb-4 tracking-widest uppercase">Platform</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-5 text-foreground">
              Why RaidFi?
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
