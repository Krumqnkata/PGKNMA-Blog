import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X, Search, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import SearchDialog from "@/components/SearchDialog";
import LoginDialog from "@/components/LoginDialog";
import RegisterDialog from "@/components/RegisterDialog";
import { useTheme } from "next-themes";
import NotificationBanner from "@/components/NotificationBanner";
import logoDark from "/logo-dark.png";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const { 
    isAuthenticated, 
    user, 
    logout,
    loginDialogOpen,
    openLoginDialog,
    closeLoginDialog
  } = useAuth();

  const { theme, setTheme, systemTheme } = useTheme();
  const logo = logoDark;

  const navLinks = [
    { name: "Начало", path: "/" },
    { name: "Новини", path: "/news" },
    { name: "Събития", path: "/events" },
    { name: "Предложения за звънец", path: "/bell-suggest" },
    { name: "Седмична анкета", path: "/weekly-poll" },
    { name: "Меме на седмицата", path: "/meme-of-the-week" },
    { name: "Контакт", path: "/contact" },
  ];

  // --- Check session on mount ---
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-[hsl(var(--header-background))] text-[hsl(var(--header-foreground))] shadow-sm ">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <img src={logo} className="h-auto w-14" alt="Logo" />
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
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="transition-transform hover:scale-105"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          
          {isAuthenticated ? (
            <>
              <span className="hidden sm:inline-block text-sm font-medium">Здравей, {user?.username}</span>
              <Button className="hidden gap-2 sm:inline-flex" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Изход
              </Button>
            </>
          ) : (
            <Button className="hidden gap-2 sm:inline-flex" onClick={openLoginDialog}>
              <LogIn className="h-4 w-4" />
              Вход
            </Button>
          )}

          {/* Mobile menu toggle */}
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

      <NotificationBanner />

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

            {isAuthenticated ? (
              <Button className="mt-4 w-full gap-2" onClick={() => { setMobileMenuOpen(false); logout(); }}>
                <LogOut className="h-4 w-4" />
                Изход
              </Button>
            ) : (
              <Button className="mt-4 w-full gap-2" onClick={() => { setMobileMenuOpen(false); openLoginDialog(); }}>
                <LogIn className="h-4 w-4" />
                Вход
              </Button>
            )}
          </div>
        </div>
      )}

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <LoginDialog open={loginDialogOpen} onOpenChange={closeLoginDialog} onOpenRegister={() => setRegisterOpen(true)} />
      <RegisterDialog open={registerOpen} onOpenChange={setRegisterOpen} />
    </header>
  );
};

export default Header;
