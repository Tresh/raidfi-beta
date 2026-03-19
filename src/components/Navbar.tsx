import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import logo from "/logo.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/whitepaper", label: "Whitepaper" },
    { href: "/contributions", label: "Contribute" },
    { href: "/contact", label: "Contact" },
  ];

  const handleLinkClick = () => setOpen(false);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-md border-b border-border' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} alt="RaidFi" className="w-7 h-7" />
            <span className="text-base font-semibold text-gradient tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              RaidFi
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </a>
            ))}
            <Button size="sm" asChild className="h-9 px-5 text-xs">
              <a href="/waitlist">Request Access</a>
            </Button>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-6 mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <img src={logo} alt="RaidFi" className="w-7 h-7 rounded-full" />
                  <span className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    RaidFi
                  </span>
                </div>
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} onClick={handleLinkClick}
                    className="text-foreground hover:text-primary transition-colors text-base font-medium">
                    {link.label}
                  </a>
                ))}
                <Button className="mt-4" asChild>
                  <a href="/waitlist" onClick={handleLinkClick}>Request Access</a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
