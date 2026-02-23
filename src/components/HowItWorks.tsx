const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            How RaidFi Works
          </h2>
          <p className="text-muted-foreground">
            Two operational modes, one unified reputation layer
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* On-Chain */}
          <div className="glass-card rounded-xl p-8">
            <p className="text-primary text-xs font-medium mb-3 uppercase tracking-wider">
              Mode 01
            </p>
            <h3 className="text-xl font-medium mb-2 text-foreground">
              On-Chain Raid Infrastructure
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Structured campaigns with optional reward distribution
            </p>
            <div className="space-y-4">
              {[
                "Projects create structured raid campaigns",
                "Raid teams or community members participate",
                "Contributions are autonomously tracked",
                "Reputation updated in real-time",
                "Rewards distributed based on verified impact"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-primary text-xs font-medium mt-0.5 min-w-[20px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Off-Chain */}
          <div className="glass-card rounded-xl p-8">
            <p className="text-primary text-xs font-medium mb-3 uppercase tracking-wider">
              Mode 02
            </p>
            <h3 className="text-xl font-medium mb-2 text-foreground">
              Off-Chain Social Analytics
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Pure intelligence, no rewards, just data
            </p>
            <div className="space-y-4">
              {[
                "Projects connect to track community/social data",
                "RaidFi tracks mentions, engagement, and influence spread",
                "Contributor velocity and reach analyzed",
                "Performance data feeds into reputation graph",
                "Actionable intelligence reports generated"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-primary text-xs font-medium mt-0.5 min-w-[20px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
          Contributor reputation persists across campaigns. No manual proof submissions required.
        </p>
      </div>
    </section>
  );
};

export default HowItWorks;
