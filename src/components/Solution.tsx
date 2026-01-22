import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Solution = () => {
  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-foreground">
              The Solution
            </h2>
            <p className="text-muted-foreground mb-8">
              Swipht introduces <strong className="text-foreground">RaidFi</strong>—a decentralized engagement 
              economy where social actions are tracked, analyzed by AI, and rewarded based on real value.
            </p>

            <div className="space-y-3 mb-8">
              {[
                "Projects create structured raid pools",
                "AI evaluates engagement quality in real-time",
                "Contributors are ranked transparently",
                "Rewards distributed based on actual impact"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <Button>
              Explore RaidFi
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="border border-border rounded-lg p-6 bg-background">
            <div className="mb-6">
              <p className="text-xs text-primary font-medium mb-1">Live Raid Pool</p>
              <h3 className="text-lg font-medium text-foreground">$SWIPHT Launch Campaign</h3>
            </div>

            <div className="space-y-3">
              {[
                { rank: 1, name: "CryptoRaider.eth", score: "9.8", reward: "$2,450" },
                { rank: 2, name: "ShillMaster.sol", score: "9.4", reward: "$1,890" },
                { rank: 3, name: "Web3Whale.bnb", score: "9.1", reward: "$1,240" },
              ].map((entry) => (
                <div key={entry.rank} className="flex items-center justify-between p-3 bg-secondary rounded-md">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                      {entry.rank}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">Score: {entry.score}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-primary">{entry.reward}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pool Size</span>
              <span className="text-lg font-medium text-foreground">$50,000</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
