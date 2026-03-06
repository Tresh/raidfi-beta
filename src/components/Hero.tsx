import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-[85vh] flex items-center justify-center relative pt-20">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-medium text-primary mb-4 tracking-wide uppercase">
            Contribution Intelligence
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight leading-[1.1]">
            The Reputation Layer{" "}
            <span className="text-gradient">for Web3</span>
          </h1>

          <p className="text-base text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
            RaidFi introduces the infrastructure layer that makes contribution measurable, reputation portable, and social performance analyzable.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <a href="/waitlist" className="group">
                Request Early Access
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/whitepaper">Read Whitepaper</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
