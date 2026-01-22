const Footer = () => {
  return (
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm font-medium text-foreground">Swipht</span>

          <div className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Twitter
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Discord
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Docs
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2024 Swipht
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
