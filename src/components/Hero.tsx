import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center pt-20">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-primary font-medium mb-4">
            The Engagement Layer of Web3
          </p>

          <h1 className="text-4xl md:text-6xl font-semibold mb-6 text-foreground tracking-tight">
            Turn Raids Into Measurable Value
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Swipht transforms chaotic social engagement into transparent, AI-ranked contributions. 
            Reward impact, not noise.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20">
            <Button size="lg">
              Start Raiding
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg">
              Create Raid Pool
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div className="text-center">
              <p className="text-2xl font-semibold text-foreground">12K+</p>
              <p className="text-sm text-muted-foreground">Raiders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-foreground">$2.4M</p>
              <p className="text-sm text-muted-foreground">Distributed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-foreground">850+</p>
              <p className="text-sm text-muted-foreground">Pools</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
