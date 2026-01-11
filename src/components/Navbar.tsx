import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-heading font-bold text-foreground">
              Swipht
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#value" className="text-muted-foreground hover:text-primary transition-colors">
              Value
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="glass" size="sm">
              Connect Wallet
            </Button>
            <Button variant="hero" size="sm">
              Launch App
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
