import { Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-heading font-bold text-foreground">Swipht</span>
          </div>

          <div className="flex items-center gap-8">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Twitter
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Discord
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Docs
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Blog
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2024 Swipht. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
