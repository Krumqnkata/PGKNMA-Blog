import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface InteriorPageProps {
  children: ReactNode;
  className?: string;
}

export function InteriorPage({ children, className }: InteriorPageProps) {
  return (
    <main className={cn("relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-gradient-to-b from-background via-background to-muted/20", className)}>
      {children}
    </main>
  );
}

interface InteriorPageHeroProps {
  eyebrow?: string;
  title: ReactNode;
  description: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

interface PageEyebrowProps {
  children: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function PageEyebrow({ children, icon: Icon, className }: PageEyebrowProps) {
  return (
    <p
      className={cn(
        "inline-flex max-w-full items-center gap-3 text-[0.68rem] font-extrabold uppercase leading-relaxed tracking-[0.22em] text-primary/85 sm:text-xs",
        className,
      )}
    >
      <span className="flex shrink-0 items-center" aria-hidden="true">
        <span className="h-px w-7 bg-gradient-to-r from-primary/30 to-primary sm:w-9" />
        <span className="h-1.5 w-1.5 rotate-45 bg-primary" />
      </span>
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />}
      <span>{children}</span>
    </p>
  );
}

export function InteriorPageHero({ eyebrow, title, description, icon: Icon, actions, children, className }: InteriorPageHeroProps) {
  return (
    <section className={cn("relative isolate overflow-hidden border-b border-border/70 py-12 sm:py-16 lg:py-20", className)}>
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_0%,hsl(var(--primary)/0.16),transparent_32%),radial-gradient(circle_at_92%_75%,hsl(210_100%_55%/0.10),transparent_34%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/0.22)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.22)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {eyebrow && <PageEyebrow icon={Icon}>{eyebrow}</PageEyebrow>}
          <h1 className={cn("text-balance text-4xl font-black leading-[1.06] tracking-[-0.035em] sm:text-5xl lg:text-6xl", eyebrow && "mt-4 sm:mt-5")}>{title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
          {actions && <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">{actions}</div>}
          {children}
        </div>
      </div>
    </section>
  );
}

interface InteriorSectionProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

export function InteriorSection({ children, className, containerClassName }: InteriorSectionProps) {
  return (
    <section className={cn("py-10 sm:py-14", className)}>
      <div className={cn("container mx-auto px-4", containerClassName)}>{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  title: ReactNode;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({ title, description, eyebrow, action, className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>}
        <h2 className={cn("text-2xl font-black tracking-tight sm:text-3xl", eyebrow && "mt-2")}>{title}</h2>
        {description && <p className="mt-2 leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
