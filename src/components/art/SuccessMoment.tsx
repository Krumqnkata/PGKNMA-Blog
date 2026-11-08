import { useEffect, useRef, type ReactNode } from "react";

import { SiteArt, type SiteArtName } from "@/components/art/SiteArt";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SuccessMomentProps {
  art: SiteArtName;
  title: string;
  children: ReactNode;
  actionLabel: string;
  onAction: () => void;
  className?: string;
}

const SPARKLES = [
  "left-[12%] top-[18%] size-3 [animation-delay:150ms]",
  "right-[14%] top-[12%] size-4 [animation-delay:320ms]",
  "left-[20%] top-[46%] size-2 [animation-delay:480ms]",
  "right-[20%] top-[42%] size-3 [animation-delay:60ms]",
];

/**
 * Stays on screen after a form is sent, unlike a toast, so the visitor can read it and knows
 * what happens next. Focus moves to the heading because the form they were in has just gone.
 */
export function SuccessMoment({ art, title, children, actionLabel, onAction, className }: SuccessMomentProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div role="status" className={cn("relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-b from-primary/10 to-card px-6 py-9 text-center shadow-lg sm:py-12", className)}>
      {SPARKLES.map((position) => (
        <svg key={position} viewBox="0 0 24 24" className={cn("art-sparkle absolute text-amber-400", position)} aria-hidden="true" focusable="false">
          <path d="M12 0c1.5 7 4 10.5 12 12-8 1.5-10.5 5-12 12-1.5-7-4-10.500-12-12 8-1.5 10.5-5 12-12Z" fill="currentColor" />
        </svg>
      ))}
      <SiteArt name={art} className="art-pop relative mx-auto block h-24 w-24 drop-shadow-sm" />
      <h2 ref={headingRef} tabIndex={-1} className="relative mt-5 text-2xl font-black tracking-tight outline-none sm:text-3xl">{title}</h2>
      <p className="relative mx-auto mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">{children}</p>
      <Button type="button" variant="outline" className="relative mt-6" onClick={onAction}>{actionLabel}</Button>
    </div>
  );
}
