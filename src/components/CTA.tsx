import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center rounded-2xl p-12 bg-primary text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Early Access
          </h2>
          <p className="mb-8 opacity-90">
            RaidFi is opening early collaboration with projects, DAOs, and communities building in Web3.
          </p>
          <Button size="lg" variant="secondary" asChild>
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
