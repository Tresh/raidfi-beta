import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";

const RaidFi = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">RaidFi</h1>
        <p className="text-sm text-muted-foreground">The reputation layer for Web3.</p>
      </div>

      <Card>
        <CardContent className="py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            We're building something exciting. Stay tuned for updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RaidFi;
