import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center relative pt-16 md:pt-20 overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />

      <div className="container mx-auto sm:px-6 relative z-10 px-[24px]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground mb-6 md:mb-8 tracking-wide">
              PROOF OF CONTRIBUTION
            </div>
          </motion.div>

          <h1 className="md:text-5xl lg:text-6xl mb-5 text-foreground tracking-tight leading-[1.08] text-4xl font-bold">
            Get credit for the work{" "}
            <span className="text-gradient">you already do</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed font-light">

            You post about crypto projects. RaidFi checks those posts, scores them, and
            turns them into a track record you keep forever — so projects can see who
            actually grew them, and pay those people.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mx-0">

            <Button size="lg" asChild className="h-11 px-7 text-sm w-full sm:w-auto">
              <a href="/waitlist" className="group">
                Join as a contributor
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-11 px-7 text-sm w-full sm:w-auto"
            >
              <a href="/project-request">Apply as a project</a>
            </Button>
          </motion.div>

          <p className="mt-4 text-xs text-muted-foreground">
            Free to join. No token, no wallet needed to start.
          </p>
        </div>
      </div>

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>);


};

export default Hero;
