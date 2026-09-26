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
    { href: "/explore", label: "Explore" },
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
              <a key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors">
                {link.label}
              </a>
            ))}
            <a href="/login" className="text-sm text-muted-foreground transition-colors">
              Sign in
            </a>
            <Button size="sm" asChild className="h-9 px-5 text-xs">
              <a href="/beta">Request Beta</a>
            </Button>
          </div>


          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <button className="p-2 text-foreground rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label="Open menu">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 [&>button]:hidden">
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} onClick={handleLinkClick}
                    className="text-foreground text-base font-medium">
                    {link.label}
                  </a>
                ))}
                <a href="/login" onClick={handleLinkClick} className="text-foreground text-base font-medium">
                  Sign in
                </a>
                <Button className="mt-4" asChild>
                  <a href="/beta" onClick={handleLinkClick}>Request Beta</a>
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
