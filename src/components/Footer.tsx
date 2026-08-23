import { Twitter, Send, Mail } from "lucide-react";
import logo from "/logo.png";

const Footer = () => {
  return (
    <footer className="py-16 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={logo} alt="RaidFi" className="w-7 h-7"/>
                <span className="text-lg font-bold text-gradient" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  RaidFi
                </span>
              </div>
              <p className="text-sm font-medium text-foreground">
                Contribution Intelligence & Reputation Infrastructure for Web3.
              </p>
              <div className="text-xs text-muted-foreground space-y-1 font-light">
                <p>Contribution should be measurable.</p>
                <p>Reputation should compound.</p>
                <p>Good work should leave a record.</p>
              </div>
            </div>

            <div className="flex flex-col md:items-end justify-between gap-6">
              <div className="flex flex-wrap items-center gap-6">
                <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</a>
                <a href="/whitepaper" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Whitepaper</a>
                <a href="/waitlist" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Waitlist</a>
                <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
              </div>

              <div className="flex items-center gap-4">
                <a href="https://x.com/raidfi_app" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://t.me/raidfi_community" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Telegram">
                  <Send className="w-5 h-5" />
                </a>
                <a href="mailto:hello.raidfi@gmail.com" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Email">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              © 2026 RaidFi. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
