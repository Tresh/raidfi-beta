import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center pt-20 pb-16 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center glass rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
            <span className="text-sm text-primary font-medium tracking-wide uppercase">
              Social Intelligence Infrastructure
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 text-foreground tracking-tight">
            The Reputation &
            <br />
            <span className="text-gradient">Social Intelligence Layer</span>
            <br />
            for Web3
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Verified contribution tracking. Portable reputation.
            Social performance analytics — built for projects, raiders,
            and raid teams.
          </p>

          <Button size="xl" asChild className="glow-cyan">
            <a href="/waitlist" className="group">
              Request Early Access
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>

          <p className="text-sm text-muted-foreground mt-6">
            Infrastructure-level access — limited early slots
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
