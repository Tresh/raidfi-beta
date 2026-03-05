import { Twitter, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="py-10 border-t border-border">
      <div className="container mx-auto px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-5">
          <img src={logo} alt="RaidFi" className="w-7 h-7 rounded-full" />
          <span className="text-sm font-semibold text-foreground">RaidFi</span>
        </div>

        <div className="flex items-center justify-center flex-wrap gap-6 mb-5">
          <a href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Infrastructure</a>
          <a href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="/#value" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Value</a>
          <a href="/whitepaper" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Whitepaper</a>
          <a href="/waitlist" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Waitlist</a>
          <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
        </div>

        <div className="flex items-center justify-center gap-4 mb-5">
          <a
            href="https://x.com/raidfi_app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a
            href="https://discord.gg/kQuabXkDmw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>

        <p className="text-xs text-muted-foreground mb-1">
          Building the credibility layer for Web3 contributor economies.
        </p>
        <p className="text-xs text-muted-foreground/60">
          © 2026 RaidFi. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
