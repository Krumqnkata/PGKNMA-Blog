import { useState } from "react";
import { Moon, Sun, Menu, X, Search, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import SearchDialog from "@/components/SearchDialog";
import LoginDialog from "@/components/LoginDialog";
import { useTheme } from "next-themes";

import logoLight from "/logo-light.png";
import logoDark from "/logo-dark.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const { theme, setTheme, systemTheme } = useTheme();
  const activeTheme = theme === "system" ? systemTheme : theme;
  const logo = activeTheme === "dark" ? logoDark : logoLight;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "News", path: "/news" },
    { name: "Events", path: "/events" },
    { name: "Bell Suggest", path: "/bell-suggest" },
    { name: "Students", path: "/students" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-[hsl(var(--header-background))] text-[hsl(var(--header-foreground))] shadow-sm">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <img src={logo} className="w-14 h-auto" alt="Logo" />
          <span className="text-xl font-bold">ПГКНМА блог</span>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className="text-sm font-medium text-[hsl(var(--header-foreground))]/80 transition-colors hover:text-[hsl(var(--header-foreground))]"
              activeClassName="text-[hsl(var(--header-foreground))]"
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex text-[hsl(var(--header-foreground))]"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="transition-transform hover:scale-105 text-[hsl(var(--header-foreground))]"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Login (Desktop) */}
          <Button
            className="hidden gap-2 sm:inline-flex"
            onClick={() => setLoginOpen(true)}
          >
            <LogIn className="h-4 w-4" />
            Вход
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background md:hidden">
          <div className="container mx-auto space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                activeClassName="bg-accent text-primary"
              >
                {link.name}
              </NavLink>
            ))}

            {/* Login (Mobile) */}
            <Button
              className="mt-4 w-full gap-2"
              onClick={() => {
                setMobileMenuOpen(false);
                setLoginOpen(true);
              }}
            >
              <LogIn className="h-4 w-4" />
              Вход
            </Button>
          </div>
        </div>
      )}

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Login Dialog */}
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </header>
  );
};

export default Header;
