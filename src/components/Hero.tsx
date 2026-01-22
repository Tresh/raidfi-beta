import WaitlistForm from "@/components/WaitlistForm";

const Hero = () => {
  return (
    <section id="waitlist" className="min-h-screen flex items-center justify-center pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
          {/* Left: Content */}
          <div className="text-center lg:text-left">
            <p className="text-sm text-primary font-medium mb-3">
              The Engagement Layer of Web3
            </p>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 text-foreground tracking-tight">
              Turn Raids Into Measurable Value
            </h1>

            <p className="text-base text-muted-foreground mb-6 max-w-md mx-auto lg:mx-0">
              Swipht transforms chaotic social engagement into transparent, AI-ranked contributions. 
              Reward impact, not noise.
            </p>

            <div className="hidden lg:block">
              <p className="text-sm text-muted-foreground">
                Join the waitlist to get early access when we launch.
              </p>
            </div>
          </div>

          {/* Right: Waitlist Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="border border-border rounded-lg p-6 bg-background shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Join the Waitlist
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Be first to know when Swipht launches.
              </p>
              <WaitlistForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
