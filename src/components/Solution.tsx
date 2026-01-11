import { ArrowRight, Brain, CheckCircle2, Trophy, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const Solution = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              The <span className="text-gradient-primary">Solution</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Swipht introduces <strong className="text-foreground">RaidFi</strong>—a decentralized engagement 
              economy where social actions are tracked, analyzed by AI, and rewarded based on real value.
            </p>

            <div className="space-y-4 mb-8">
              {[
                "Projects create structured raid pools",
                "AI evaluates engagement quality in real-time",
                "Contributors are ranked transparently",
                "Rewards distributed based on actual impact"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg">
              Explore RaidFi
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="relative">
            <div className="glass-card rounded-2xl p-8 border-primary/20">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">Live Raid Pool</span>
                </div>
                <h3 className="text-2xl font-heading font-bold text-foreground">$SWIPHT Launch Campaign</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-foreground">CryptoRaider.eth</p>
                      <p className="text-xs text-muted-foreground">Score: 9.8</p>
                    </div>
                  </div>
                  <span className="text-primary font-bold">$2,450</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-foreground">ShillMaster.sol</p>
                      <p className="text-xs text-muted-foreground">Score: 9.4</p>
                    </div>
                  </div>
                  <span className="text-primary font-bold">$1,890</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Web3Whale.bnb</p>
                      <p className="text-xs text-muted-foreground">Score: 9.1</p>
                    </div>
                  </div>
                  <span className="text-primary font-bold">$1,240</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Pool Size</span>
                </div>
                <span className="text-xl font-heading font-bold text-foreground">$50,000</span>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center animate-float shadow-lg shadow-primary/30">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
