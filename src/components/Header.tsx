import { lazy, Suspense, useEffect, useState } from "react";
import { ChevronDown, Search, User as UserIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/use-auth";
import { useAccessibility } from "@/hooks/use-accessibility";
import { useSettings } from "@/hooks/use-settings";
import SeasonalLogo from "@/components/SeasonalLogo";
import { UserDropdown } from "@/components/UserDropdown";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import ThemeSelector from "@/components/ThemeSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isNavLinkActive, siteNavLinks } from "@/lib/site-navigation";
import { cn } from "@/lib/utils";

const headerLinks = siteNavLinks.filter(({ header }) => header);
const headerMoreLinks = siteNavLinks.filter(({ header, path }) => !header && path !== "/");

const desktopLinkClass = "relative inline-flex h-10 items-center rounded-full px-3.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

const DesktopNavigation = () => {
  const { pathname } = useLocation();
  const moreActive = headerMoreLinks.some(({ path }) => isNavLinkActive(path, pathname));

  return (
    <ul className="hidden min-w-0 items-center gap-0.5 lg:flex">
      {headerLinks.map(({ name, path }) => {
        const active = isNavLinkActive(path, pathname);
        return (
          <li key={path}>
            <Link
              to={path}
              aria-current={active ? "page" : undefined}
              className={cn(desktopLinkClass, active && "bg-white/15 text-white")}
            >
              {name}
            </Link>
          </li>
        );
      })}
      <li>
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(desktopLinkClass, "gap-1 data-[state=open]:bg-white/15", moreActive && "bg-white/15 text-white")}>
            Още
            <ChevronDown className="h-4 w-4 opacity-80" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" sideOffset={10} className="grid w-[30rem] grid-cols-2 gap-1 rounded-2xl p-2">
            {headerMoreLinks.map(({ name, path, icon: Icon }) => (
              <DropdownMenuItem key={path} asChild className="cursor-pointer rounded-xl p-0">
                <Link
                  to={path}
                  aria-current={isNavLinkActive(path, pathname) ? "page" : undefined}
                  className={cn("flex items-center gap-3 px-3 py-2.5 text-sm font-medium", isNavLinkActive(path, pathname) && "bg-accent text-primary")}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
                  </span>
                  {name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
    </ul>
  );
};

const Header = () => {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isAuthenticated, loginDialogOpen, openLoginDialog, closeLoginDialog } = useAuth();
  const { settings } = useSettings();
  const { reduceMotion } = useAccessibility();
  const headerLogo = settings?.header_logo ?? null;
  const greeting = headerLogo?.greeting ?? "";
  const effect = !reduceMotion && headerLogo && headerLogo.effect !== "none" ? headerLogo.effect : null;

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
      {effect && (
        <Suspense fallback={null}>
          <SeasonalEffect effect={effect} />
        </Suspense>
      )}
      <nav aria-label="Горна навигация" className="container relative mx-auto flex h-[var(--site-header-height)] items-center justify-between gap-2 px-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-4 xl:gap-8">
          <NavLink
            to="/"
            className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-80"
            aria-label={greeting ? `ПГКНМА Блог — начало. ${greeting}` : "ПГКНМА Блог — начало"}
            title={greeting || undefined}
          >
            <SeasonalLogo logo={headerLogo} />
          </NavLink>
          <DesktopNavigation />
        </div>

        <div className="site-header-actions flex shrink-0 items-center gap-0 sm:gap-1 md:gap-2">
          <Button type="button" variant="ghost" className="w-10 gap-2 rounded-full px-0 text-white/85 hover:bg-white/10 hover:text-white md:w-auto md:border md:border-white/10 md:px-3 lg:w-10 lg:px-0 xl:w-auto xl:px-3" onClick={() => setSearchOpen(true)} aria-label="Отвори глобалното търсене">
            <Search aria-hidden="true" />
            <span className="hidden text-sm md:inline lg:hidden xl:inline">Търсене</span>
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
      {greeting && (
        // On wide screens the greeting sits under the logo; narrower screens get this slim strip.
        <p aria-hidden="true" className="site-header-greeting relative flex h-[var(--header-greeting-height)] items-center justify-center border-t border-white/10 px-4 text-xs font-semibold tracking-wide text-white/90 xl:hidden">
          <span className="truncate">{greeting}</span>
        </p>
      )}

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
const SeasonalEffect = lazy(() => import("@/components/SeasonalEffect"));
