import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <section className="py-24 bg-foreground">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-background">
            Ready to Transform Social Engagement?
          </h2>

          <p className="text-background/70 mb-8">
            Swipht is the infrastructure for valuing, ranking, 
            and rewarding social contribution in Web3.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
              Launch App
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg" className="border-background/20 text-background hover:bg-background/10">
              Read Docs
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
