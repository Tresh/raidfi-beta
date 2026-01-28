import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center pt-20 pb-16">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-primary font-medium mb-4 tracking-wide uppercase">
            The Engagement Layer of Web3
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 text-foreground tracking-tight">
            Turn Raids Into
            <br />
            <span className="text-primary">Measurable Value</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Swipht transforms chaotic social engagement into transparent,
            AI-ranked contributions. Reward impact, not noise.
          </p>

          <Button size="xl" asChild>
            <a href="/waitlist" className="group">
              Join the Waitlist
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>

          <p className="text-sm text-muted-foreground mt-6">
            Be first to know when we launch
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
