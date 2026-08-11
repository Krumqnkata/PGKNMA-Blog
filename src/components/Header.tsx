import { lazy, Suspense, useEffect, useState } from "react";
import { HelpCircle, Menu, X, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import logoDark from "/logo-dark.png";
import { useAuth } from "@/hooks/use-auth";
import { UserDropdown } from "./UserDropdown";
import { useLocation } from "react-router-dom";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import FloatingFAQ from "@/components/FloatingFAQ";
import ThemeSelector from "@/components/ThemeSelector";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const { 
    isAuthenticated, 
    logout,
    loginDialogOpen,
    openLoginDialog,
    closeLoginDialog
  } = useAuth();
  
  const location = useLocation();
  const isOnProfilePage = location.pathname === '/profile';

  const logo = logoDark;

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-50 w-full bg-[hsl(var(--header-background)/0.92)] text-[hsl(var(--header-foreground))] shadow-sm backdrop-blur-md">
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <nav className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <img src={logo} className="h-auto w-10" alt="Logo" />
          <span className="hidden text-[15px] font-bold uppercase tracking-widest sm:inline">ПГКНМА Блог</span>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className="text-sm font-medium text-white/80 transition-colors hover:text-primary"
              activeClassName="text-primary"
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <FloatingFAQ />
          <AccessibilityWidget />
          <Suspense fallback={<div className="h-[40px] w-[40px]" aria-hidden="true" />}>
            <div className="[&_button]:h-[40px] [&_button]:w-[40px]"><NotificationBell /></div>
          </Suspense>

          <ThemeSelector />

          <div>
            {isAuthenticated ? (
              <UserDropdown />
            ) : (
              <Button variant="ghost" size="icon" className="h-[40px] w-[40px] rounded-full" onClick={openLoginDialog} aria-label="Отвори вход в профила">
                <UserIcon className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-[40px] w-[40px] lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? "Затвори менюто" : "Отвори менюто"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="border-b border-border bg-background text-foreground shadow-xl animate-in slide-in-from-top-2 duration-200 lg:hidden">
          <div className="container mx-auto space-y-1 px-4 py-4">
            {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                  activeClassName="bg-accent text-primary"
                >
                  {link.name && <span>{link.name}</span>}
                </NavLink>
            ))}

            <NavLink
              to="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeClassName="bg-accent text-primary"
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              Помощ и въпроси
            </NavLink>

            <div className="border-t border-border/40 pt-4 mt-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    activeClassName="bg-accent text-primary"
                  >
                    Моят профил
                  </NavLink>
                  {!isOnProfilePage && (
                     <Button variant="outline" className="w-full gap-2" onClick={() => { setMobileMenuOpen(false); logout(); }}>
                      <LogOut className="h-4 w-4" />
                      Изход
                    </Button>
                  )}
                </>
              ) : (
                <Button className="w-full gap-2" onClick={() => { setMobileMenuOpen(false); openLoginDialog(); }}>
                  <LogIn className="h-4 w-4" />
                  Вход
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        {loginDialogOpen && <LoginDialog open onOpenChange={closeLoginDialog} onOpenRegister={() => setRegisterOpen(true)} />}
        {registerOpen && <RegisterDialog open onOpenChange={setRegisterOpen} onOpenLogin={openLoginDialog} />}
      </Suspense>
    </header>
  );
};

export default Header;

const NotificationBell = lazy(() => import("@/components/NotificationBell"));
const LoginDialog = lazy(() => import("@/components/LoginDialog"));
const RegisterDialog = lazy(() => import("@/components/RegisterDialog"));

const navLinks = [
  { name: "Начало", path: "/" },
  { name: "Новини", path: "/news" },
  { name: "Събития", path: "/events" },
  { name: "Предложения за звънец", path: "/bell-suggest" },
  { name: "Седмична анкета", path: "/weekly-poll" },
  { name: "Меме на седмицата", path: "/meme-of-the-week" },
  { name: "Програма", path: "/program" },
] as const;
