import { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { isNavLinkActive, siteNavLinks } from "@/lib/site-navigation";
import { cn } from "@/lib/utils";

const visibleLinks = siteNavLinks.filter(({ bottomNav }) => bottomNav);
const moreLinks = siteNavLinks.filter(({ bottomNav }) => !bottomNav);

const BottomNavigation = () => {
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = moreLinks.some(({ path }) => isNavLinkActive(path, pathname));

  useEffect(() => setMoreOpen(false), [pathname]);

  const itemClass = "flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[clamp(0.6875rem,0.6rem+0.3vw,0.8125rem)] font-semibold leading-tight transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const iconClass = "size-[clamp(1.25rem,1.125rem+0.2vw,1.375rem)]";
  const iconContainerClass = "flex h-[clamp(1.625rem,1.5rem+0.25vw,1.875rem)] w-[clamp(2.5rem,2.25rem+0.5vw,3rem)] shrink-0 items-center justify-center rounded-lg transition-colors";

  return (
    <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
      <nav aria-label="Основна навигация" className="site-bottom-navigation fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom,0px)] text-foreground shadow-[0_-8px_30px_-16px_hsl(var(--foreground)/0.35)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid h-[var(--site-bottom-nav-height)] max-w-2xl px-1 sm:px-3" style={{ gridTemplateColumns: `repeat(${visibleLinks.length + 1}, minmax(0, 1fr))` }}>
          {visibleLinks.map(({ name, path, icon: Icon }) => {
            const active = isNavLinkActive(path, pathname);
            return (
              <Link key={path} to={path} aria-current={active ? "page" : undefined} className={cn(itemClass, active ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
                <span className={cn(iconContainerClass, active && "bg-primary/10")}>
                  <Icon className={cn(iconClass, active && "stroke-[2.5]")} aria-hidden="true" />
                </span>
                <span className="truncate text-center">{name}</span>
              </Link>
            );
          })}
          <SheetTrigger asChild>
            <button type="button" className={cn(itemClass, (moreOpen || moreActive) ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <span className={cn(iconContainerClass, (moreOpen || moreActive) && "bg-primary/10")}>
                <MoreHorizontal className={iconClass} aria-hidden="true" />
              </span>
              <span>Още</span>
            </button>
          </SheetTrigger>
        </div>
      </nav>

      <SheetContent side="bottom" className="mx-auto max-h-[calc(100dvh-3rem)] max-w-xl overflow-y-auto overscroll-contain rounded-t-3xl pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
        <SheetHeader className="pr-10 text-left">
          <SheetTitle>Още от сайта</SheetTitle>
          <SheetDescription>Разгледай останалите раздели.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Още раздели" className="mt-5 grid grid-cols-2 gap-2">
          {moreLinks.map(({ name, path, icon: Icon }) => (
            <NavLink key={path} to={path} onClick={() => setMoreOpen(false)} className={({ isActive }) => cn(
              "flex min-h-[4.5rem] flex-col items-start justify-center gap-2 rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm font-semibold leading-tight text-foreground transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive && "border-primary/50 bg-accent text-primary",
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
