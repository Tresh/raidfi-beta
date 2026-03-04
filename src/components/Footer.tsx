import { Twitter, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <img src={logo} alt="RaidFi" className="w-7 h-7 rounded-full" />
              <span className="text-sm font-semibold text-foreground">RaidFi</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Building the credibility layer for Web3 contributor economies.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-foreground uppercase tracking-wider mb-3">Product</p>
            <div className="flex flex-col gap-2">
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Infrastructure</a>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#value" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Value</a>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-foreground uppercase tracking-wider mb-3">Company</p>
            <div className="flex flex-col gap-2">
              <a href="/waitlist" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Waitlist</a>
              <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-foreground uppercase tracking-wider mb-3">Social</p>
            <div className="flex items-center gap-3">
              <a
                href="https://x.com/raidfi_app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <p className="text-xs text-muted-foreground text-center">
            © 2026 RaidFi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
