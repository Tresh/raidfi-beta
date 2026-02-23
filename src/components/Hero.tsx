import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-[85vh] flex items-center justify-center pt-20 pb-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary/4 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center glass rounded-full px-3 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 animate-pulse" />
            <span className="text-xs text-primary font-medium tracking-wide uppercase">
              Social Intelligence Infrastructure
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 text-foreground tracking-tight leading-tight">
            The Reputation &
            <br />
            <span className="text-gradient">Social Intelligence Layer</span>
            <br />
            for Web3
          </h1>

          <p className="text-base text-muted-foreground mb-8 max-w-lg mx-auto">
            Verified contribution tracking, portable reputation,
            and social performance analytics for projects, raiders,
            and communities.
          </p>

          <Button size="lg" asChild className="glow-cyan">
            <a href="/waitlist" className="group">
              Request Early Access
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Infrastructure-level access, limited early slots
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
