import { Link } from "react-router-dom";

import { SiteArt, type SiteArtName } from "@/components/art/SiteArt";
import { loginPath, registerPath } from "@/lib/auth-paths";
import { cn } from "@/lib/utils";

export type AuthMode = "login" | "register";

const TABS: { mode: AuthMode; label: string; art: SiteArtName; href: (next: string) => string }[] = [
  { mode: "login", label: "Вход", art: "key", href: loginPath },
  { mode: "register", label: "Регистрация", art: "badge", href: registerPath },
];

interface AuthSwitchProps {
  active: AuthMode;
  /** The page to return to after signing in; both tabs keep it. */
  next: string;
}

/**
 * Switches between /login and /register. The two are separate pages, so the sliding tile
 * replays its move from the other side whenever a page opens (see index.css).
 */
export function AuthSwitch({ active, next }: AuthSwitchProps) {
  return (
    <nav aria-label="Вход или регистрация" className="relative grid grid-cols-2 overflow-hidden rounded-full border border-border/70 bg-muted/70 p-1">
      <span
        aria-hidden="true"
        className={cn(
          "auth-switch-tile pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-card shadow-md ring-1 ring-primary/20",
          active === "register" && "auth-switch-tile-right",
        )}
      />
      {TABS.map(({ mode, label, art, href }) => {
        const isActive = mode === active;
        return (
          <Link
            key={mode}
            to={href(next)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative z-10 flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-full px-2 text-[0.8125rem] font-bold transition-colors sm:gap-2 sm:px-3 sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <SiteArt
              name={art}
              className={cn(
                "h-6 w-6 transition-transform duration-300 motion-reduce:transition-none sm:h-7 sm:w-7",
                isActive ? "art-pop" : "opacity-60 grayscale group-hover:-rotate-12 group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0",
              )}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
