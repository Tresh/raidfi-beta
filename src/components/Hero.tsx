import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center relative pt-16 md:pt-20 overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />

      <div className="container mx-auto sm:px-6 relative z-10 px-[24px]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground mb-6 md:mb-8 tracking-wide">
              CONTRIBUTION INTELLIGENCE FOR WEB3
            </div>
          </div>

          <h1 className="md:text-5xl lg:text-6xl mb-5 text-foreground tracking-tight leading-[1.08] text-4xl font-bold animate-in fade-in slide-in-from-bottom-4 duration-500">
            See who actually{" "}
            <span className="text-gradient">contributes</span> to your ecosystem
          </h1>

          <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed font-light animate-in fade-in slide-in-from-bottom-5 duration-500 delay-100">
            RaidFi tracks contribution across X, Discord and Telegram, turns it into
            structured data, and builds a reputation record that shows who consistently
            adds value - not who posts the most.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mx-0 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-150">
            <Button size="lg" asChild className="h-11 px-7 text-sm w-full sm:w-auto">
              <a href="/beta" className="group">
                Request beta access
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-11 px-7 text-sm w-full sm:w-auto"
            >
              <a href="/project-request">Apply as a project</a>
            </Button>
          </div>

          {/* <p className="mt-4 text-xs text-muted-foreground">
            No token. No wallet needed to get started.
          </p> */}
        </div>
      </div>

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>);


};

export default Hero;
