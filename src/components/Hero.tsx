import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center relative pt-20 md:pt-24 pb-16 overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />

      <div className="container mx-auto sm:px-6 relative z-10 px-[24px]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground mb-6 md:mb-8 tracking-wide">
              CONTRIBUTION INTELLIGENCE FOR WEB3
            </div>
          </motion.div>

          <h1 className="md:text-5xl lg:text-6xl mb-6 text-foreground tracking-tight leading-[1.08] text-4xl font-bold">
            The people building your ecosystem deserve more than a <span className="text-gradient">like count</span>.
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed font-light">
            RaidFi turns contribution across Web3 communities into structured data, meaningful insights, and a reputation that compounds over time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-sm md:text-base text-foreground/80 mb-10 max-w-xl mx-auto space-y-2 font-normal">
            <p><strong className="text-foreground">For contributors:</strong> build a credible record of the work you do.</p>
            <p><strong className="text-foreground">For projects:</strong> understand who is actually contributing and what that contribution looks like.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mx-0">

            <Button size="lg" asChild className="h-11 px-7 text-sm w-full sm:w-auto">
              <a href="/waitlist" className="group">
                Join as a Contributor
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-11 px-7 text-sm w-full sm:w-auto"
            >
              <a href="/project-request">Bring Your Project</a>
            </Button>
          </motion.div>

          <p className="mt-6 text-xs text-muted-foreground">
            No token. No wallet required to get started.
          </p>
        </div>
      </div>

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
