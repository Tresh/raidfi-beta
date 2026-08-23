import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const benefits = [
  "Contributors can build durable credibility.",
  "Projects can make better contributor decisions.",
  "Communities can recognize meaningful participation.",
  "Ecosystems can rely less on surface-level metrics.",
];

const WhyThisMatters = () => {
  return (
    <section className="py-24 md:py-32 border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-xs font-medium text-primary mb-4 tracking-widest uppercase">
              WHY THIS MATTERS
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Web3 has infrastructure for assets. It needs infrastructure for contribution.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card border border-border p-6 rounded-xl space-y-2">
              <p className="text-sm font-semibold text-foreground">Protocols can track transactions.</p>
            </div>
            <div className="bg-card border border-border p-6 rounded-xl space-y-2">
              <p className="text-sm font-semibold text-foreground">Communities can track members.</p>
            </div>
            <div className="bg-card border border-border p-6 rounded-xl space-y-2">
              <p className="text-sm font-semibold text-foreground">Platforms can track engagement.</p>
            </div>
          </div>

          <div className="bg-card border border-border p-8 rounded-2xl max-w-3xl mx-auto text-center space-y-6">
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light">
              But there is still a gap between activity and credible contribution. <strong className="text-foreground font-semibold">RaidFi is building the layer that connects them.</strong>
            </p>

            <div className="pt-4 border-t border-border">
              <p className="text-sm font-medium text-foreground mb-4">When contribution becomes structured:</p>
              <div className="grid sm:grid-cols-2 gap-4 text-left">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                    <span className="text-sm text-foreground/90 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyThisMatters;
