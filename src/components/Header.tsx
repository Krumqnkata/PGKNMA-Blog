import { lazy, Suspense, useEffect, useState } from "react";
import { Search, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import logoDark from "/logo-dark.png";
import { useAuth } from "@/hooks/use-auth";
import { UserDropdown } from "@/components/UserDropdown";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import ThemeSelector from "@/components/ThemeSelector";

const Header = () => {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isAuthenticated, loginDialogOpen, openLoginDialog, closeLoginDialog } = useAuth();

  useEffect(() => {
    const openSearch = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", openSearch);
    return () => window.removeEventListener("keydown", openSearch);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[hsl(var(--header-background)/0.96)] pt-[env(safe-area-inset-top,0px)] text-[hsl(var(--header-foreground))] shadow-sm backdrop-blur-md">
      <nav aria-label="Горна навигация" className="container mx-auto flex h-[var(--site-header-height)] items-center justify-between gap-2 px-2 sm:px-4">
        <NavLink to="/" className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-80" aria-label="ПГКНМА Блог — начало">
          <img src={logoDark} className="h-auto w-[clamp(2.25rem,2rem+0.5vw,2.5rem)]" alt="" />
          <span className="hidden text-[clamp(0.875rem,0.75rem+0.2vw,1rem)] font-bold uppercase tracking-widest sm:inline">ПГКНМА Блог</span>
        </NavLink>

        <div className="site-header-actions flex shrink-0 items-center gap-0 sm:gap-1 md:gap-2">
          <Button type="button" variant="ghost" className="w-10 gap-2 rounded-full px-0 text-white/85 hover:bg-white/10 hover:text-white md:w-auto md:border md:border-white/10 md:px-3" onClick={() => setSearchOpen(true)} aria-label="Отвори глобалното търсене">
            <Search aria-hidden="true" />
            <span className="hidden text-sm md:inline">Търсене</span>
            <kbd className="hidden rounded border border-white/15 bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/60 xl:inline">Ctrl K</kbd>
          </Button>
          <AccessibilityWidget />
          <ThemeSelector />
          <Suspense fallback={<div className="h-10 w-10" aria-hidden="true" />}>
            <NotificationBell />
          </Suspense>
          {isAuthenticated ? (
            <UserDropdown />
          ) : (
            <Button variant="ghost" size="icon" className="rounded-full" onClick={openLoginDialog} aria-label="Отвори вход в профила">
              <UserIcon aria-hidden="true" />
            </Button>
          )}
        </div>
      </nav>

      <Suspense fallback={null}>
        {searchOpen && <SearchDialog open onOpenChange={setSearchOpen} />}
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
const SearchDialog = lazy(() => import("@/components/SearchDialog"));
