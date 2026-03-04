import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 text-foreground tracking-tight leading-tight">
            The Data &
            <br />
            <span className="text-gradient">Reputation Layer</span>
            <br />
            for Web3
          </h1>

          <p className="text-base text-muted-foreground mb-8 max-w-lg mx-auto">
            A unified intelligence layer that transforms social activity
            into measurable performance, persistent credibility,
            and structured analytics.
          </p>

          <Button size="lg" asChild>
            <a href="/waitlist" className="group">
              Request Early Access
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Protocol-grade infrastructure · Limited early slots
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
