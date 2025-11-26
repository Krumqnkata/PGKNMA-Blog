import { useState } from "react";
import { Moon, Sun, Menu, X, Search, LogIn, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { NavLink } from "@/components/NavLink";
import SearchDialog from "@/components/SearchDialog";
import Login from "@/pages/Login";
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const {
    theme,
    setTheme
  } = useTheme();
  const navLinks = [{
    name: "Home",
    path: "/"
  }, {
    name: "News",
    path: "/news"
  }, {
    name: "Events",
    path: "/events"
  }, {
    name: "Bell Suggest",
    path: "/bell-suggest#bell-song"
  }, {
    name: "Students",
    path: "/students"
  }, {
    name: "Contact",
    path: "/contact"
  }];
  return <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-[hsl(var(--header-background))] text-[hsl(var(--header-foreground))] shadow-sm">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Coffee className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">PGKNMA Blog</span>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map(link => <NavLink key={link.path} to={link.path} className="text-sm font-medium text-[hsl(var(--header-foreground))]/80 transition-colors hover:text-[hsl(var(--header-foreground))]" activeClassName="text-[hsl(var(--header-foreground))]">
              {link.name}
            </NavLink>)}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-[hsl(var(--header-foreground))]" onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme" className="transition-transform hover:scale-105 text-[hsl(var(--header-foreground))]">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <NavLink to="/login">
            <Button className="hidden gap-2 sm:inline-flex">
              <LogIn className="h-4 w-4" />
              Вход
            </Button>
          </NavLink>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && <div className="border-b border-border bg-background md:hidden">
          <div className="container mx-auto space-y-1 px-4 py-4">
            {navLinks.map(link => <NavLink key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" activeClassName="bg-accent text-primary">
                {link.name}
              </NavLink>)}
            <Button className="mt-4 w-full gap-2">
              <LogIn className="h-4 w-4" />
              Вход
            </Button>
          </div>
        </div>}

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>;
};
export default Header;
