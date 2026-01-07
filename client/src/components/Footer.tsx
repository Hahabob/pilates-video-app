function Footer() {
  return (
    <footer
      className="border-t border-border mt-auto"
      style={{ backgroundColor: "hsl(290, 20%, 98.2%)" }}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © 2025 שמיים וארץ. כל הזכויות שמורות
            </p>
          </div>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              יצירת קשר
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
