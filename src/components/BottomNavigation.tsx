import { useEffect, useState, useSyncExternalStore } from "react";
import { MoreHorizontal } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { additionalNavLinks, siteNavLinks } from "@/lib/site-navigation";
import { cn } from "@/lib/utils";

const breakpoints = [...new Set(siteNavLinks.map(({ minWidth }) => minWidth))].filter((width) => width > 0);
const getBreakpoint = () => Math.max(0, ...breakpoints.filter((width) => window.matchMedia(`(min-width: ${width}px)`).matches));
const subscribeToWidth = (onChange: () => void) => {
  const queries = breakpoints.map((width) => window.matchMedia(`(min-width: ${width}px)`));
  queries.forEach((query) => query.addEventListener("change", onChange));
  return () => queries.forEach((query) => query.removeEventListener("change", onChange));
};

const BottomNavigation = () => {
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const breakpoint = useSyncExternalStore(subscribeToWidth, getBreakpoint, () => 0);
  const visibleLinks = siteNavLinks.filter(({ minWidth }) => minWidth <= breakpoint);
  const moreLinks = [...siteNavLinks.filter(({ minWidth }) => minWidth > breakpoint), ...additionalNavLinks];
  const moreActive = moreLinks.some(({ path }) => pathname === path);

  useEffect(() => setMoreOpen(false), [pathname]);

  const itemClass = "flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[clamp(0.625rem,0.5rem+0.3vw,0.75rem)] font-semibold leading-tight transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const iconClass = "size-[clamp(1.25rem,1.125rem+0.2vw,1.375rem)]";
  const iconContainerClass = "flex h-[clamp(1.625rem,1.5rem+0.25vw,1.875rem)] w-[clamp(2.5rem,2.25rem+0.5vw,3rem)] shrink-0 items-center justify-center rounded-lg transition-colors";

  return (
    <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
      <nav aria-label="Основна навигация" className="site-bottom-navigation fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom,0px)] text-foreground shadow-[0_-8px_30px_-16px_hsl(var(--foreground)/0.35)] backdrop-blur-xl">
        <div className="mx-auto grid h-[var(--site-bottom-nav-height)] max-w-[1440px] px-1 sm:px-3" style={{ gridTemplateColumns: `repeat(${visibleLinks.length + 1}, minmax(0, 1fr))` }}>
          {visibleLinks.map(({ name, path, icon: Icon }) => {
            const active = pathname === path || (path === "/news" && pathname.startsWith("/post/"));
            return (
              <Link key={path} to={path} aria-current={active ? "page" : undefined} className={cn(itemClass, active ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
                <span className={cn(iconContainerClass, active && "bg-primary/10")}>
                  <Icon className={cn(iconClass, active && "stroke-[2.5]")} aria-hidden="true" />
                </span>
                <span className="min-h-[2.5em] text-center">{name}</span>
              </Link>
            );
          })}
          <SheetTrigger asChild>
            <button type="button" className={cn(itemClass, (moreOpen || moreActive) ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <span className={cn(iconContainerClass, (moreOpen || moreActive) && "bg-primary/10")}>
                <MoreHorizontal className={iconClass} aria-hidden="true" />
              </span>
              <span className="min-h-[2.5em]">Още</span>
            </button>
          </SheetTrigger>
        </div>
      </nav>

      <SheetContent side="bottom" className="mx-auto max-h-[calc(100dvh-3rem)] max-w-xl overflow-y-auto overscroll-contain pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
        <SheetHeader className="pr-10 text-left">
          <SheetTitle>Още от сайта</SheetTitle>
          <SheetDescription>Разгледай останалите раздели.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Още раздели" className="mt-5 grid gap-1">
          {moreLinks.map(({ name, path, icon: Icon }) => (
            <NavLink key={path} to={path} onClick={() => setMoreOpen(false)} className={({ isActive }) => cn(
              "flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive && "bg-accent text-primary",
            )}>
              <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default BottomNavigation;
