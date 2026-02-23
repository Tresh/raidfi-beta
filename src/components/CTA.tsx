import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center glass-card rounded-2xl p-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            Early Collaboration
          </h2>
          <p className="text-muted-foreground mb-8">
            Want to integrate RaidFi into your project or explore a partnership? We're open to early collaborations with teams building in Web3.
          </p>
          <Button size="lg" asChild className="glow-cyan">
            <a href="mailto:hello@raidfi.com" className="group">
              Get in Touch
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            hello@raidfi.com
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
