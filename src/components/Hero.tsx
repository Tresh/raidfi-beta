import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 text-foreground tracking-tight leading-[1.1]">
            The Contribution Intelligence & <span className="text-gradient">Reputation Layer</span> for Web3
          </h1>

          <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
            RaidFi introduces the infrastructure layer that makes contribution measurable, reputation portable, and social performance analyzable.
          </p>

          <Button size="lg" asChild>
            <a href="/waitlist" className="group">
              Request Early Access
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>

          <p className="text-xs text-muted-foreground mt-4">

          </p>
        </div>
      </div>
    </section>);

};

export default Hero;