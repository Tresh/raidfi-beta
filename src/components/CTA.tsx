import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section className="py-20 md:py-32 bg-card">
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-5">
                Ready to build on reputation?
              </h2>
              <p className="mb-8 sm:mb-10 opacity-80 text-base sm:text-lg font-light max-w-md mx-auto">
                RaidFi is opening early collaboration with projects, DAOs, and communities building in Web3.
              </p>
              <Button size="lg" variant="secondary" asChild className="h-11 px-7 text-sm w-full sm:w-auto">
                <a href="/contact" className="group inline-flex items-center justify-center">
                  Request Early Access
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
