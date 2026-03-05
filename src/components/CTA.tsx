import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center glass-card rounded-2xl p-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            Early Access
          </h2>
          <p className="text-muted-foreground mb-8">
            RaidFi is opening early collaboration with projects, DAOs, and communities building in Web3.
          </p>
          <Button size="lg" asChild>
            <a href="/contact" className="group">
              Request Early Access
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Building the credibility layer for Web3 contributor economies.
        </p>
      </div>
    </section>
  );
};

export default CTA;
