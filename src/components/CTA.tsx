import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section className="py-20 md:py-32 bg-card border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="rounded-3xl px-6 py-12 sm:p-16 bg-primary text-primary-foreground relative overflow-hidden">
            {/* Subtle pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(0_0%_100%/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(0_0%_100%/0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]" />

            <div className="relative z-10">
              <p className="text-xs font-medium tracking-widest uppercase mb-3 text-primary-foreground/80">
                EARLY ACCESS
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-5">
                Start building your contribution record.
              </h2>
              <p className="mb-8 sm:mb-10 opacity-90 text-base sm:text-lg font-light max-w-md mx-auto leading-relaxed">
                RaidFi is being built as the contribution intelligence and reputation layer for Web3. Join early and help shape the infrastructure.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Button size="lg" variant="secondary" asChild className="h-11 px-7 text-sm w-full sm:w-auto">
                  <a href="/waitlist" className="group inline-flex items-center justify-center">
                    Join as a Contributor
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-11 px-7 text-sm w-full sm:w-auto bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <a href="/project-request">Bring Your Project</a>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
