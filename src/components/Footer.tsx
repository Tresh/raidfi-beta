import { Twitter, Send, Mail } from "lucide-react";
import logo from "/logo.png";

const Footer = () => {
  return (
    <footer className="py-16 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <img src={logo} alt="RaidFi" className="w-7 h-7"/>
              <span className="text-sm font-semibold text-gradient" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                RaidFi
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</a>
              <a href="/whitepaper" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Whitepaper</a>
              <a href="/changelog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Changelog</a>
              <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
              <a href="/beta" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Request beta</a>
              <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://x.com/raidfi_app"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow RaidFi on X (formerly Twitter)"
                title="Follow on X"
                className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://t.me/raidfi_community"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join RaidFi Telegram community"
                title="Join Telegram"
                className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Send className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello.raidfi@gmail.com"
                aria-label="Send email to RaidFi"
                title="Email Us"
                className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-center">
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
