import { useState, type ReactNode } from "react";
import { Loader2, RefreshCw } from "lucide-react";

import { SiteArt, type SiteArtName } from "@/components/art/SiteArt";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ERROR_JOKES, pickRandom } from "@/lib/playful-messages";

/** Visible caption naming exactly what a skeleton is waiting for. */
export const LoadingCaption = ({ label, className = "" }: { label: string; className?: string }) => (
  <p className={`flex items-center gap-2 text-sm font-medium text-muted-foreground ${className}`}>
    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" />
    {label}…
  </p>
);

interface ContentSkeletonProps {
  count?: number;
  variant?: "cards" | "list" | "detail";
  label?: string;
  className?: string;
}

export function ContentSkeleton({ count = 3, variant = "cards", label = "Зареждане на съдържанието", className = "" }: ContentSkeletonProps) {
  if (variant === "detail") {
    return (
      <div role="status" aria-label={label} className={`mx-auto w-full max-w-4xl space-y-5 py-8 ${className}`}>
        <LoadingCaption label={label} />
        <Skeleton className="h-10 w-4/5" /><Skeleton className="h-5 w-2/5" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
      </div>
    );
  }

  return (
    <div role="status" aria-label={label} className={`${variant === "cards" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"} ${className}`}>
      <LoadingCaption label={label} className="col-span-full" />
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          {variant === "cards" && <Skeleton className="mb-4 aspect-video w-full rounded-xl" />}
          <div className="space-y-3"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-1/2" /></div>
        </div>
      ))}
    </div>
  );
}

interface QueryErrorStateProps {
  message?: string;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

export function QueryErrorState({ title = "Съдържанието не можа да се зареди", message, onRetry, className = "" }: QueryErrorStateProps) {
  const [joke] = useState(() => pickRandom(ERROR_JOKES));

  return (
    <div role="alert" className={`rounded-2xl border border-destructive/35 bg-destructive/5 p-7 text-center shadow-sm ${className}`}>
      <SiteArt name="pencil" className="mx-auto block h-14 w-14" />
      <h2 className="mt-3 text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm font-medium">{joke}</p>
      {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
      {onRetry && <Button type="button" variant="outline" className="mt-4" onClick={onRetry}><RefreshCw className="h-4 w-4" aria-hidden="true" />Опитай отново</Button>}
    </div>
  );
}

interface QueryEmptyStateProps {
  title: string;
  description?: string;
  art?: SiteArtName;
  className?: string;
  /** The next step, such as a link to where this list gets filled. */
  children?: ReactNode;
}

export function QueryEmptyState({ title, description, art = "box", className = "", children }: QueryEmptyStateProps) {
  return (
    <div className={`rounded-2xl border-2 border-dashed border-border/80 bg-card/50 p-8 text-center ${className}`}>
      <SiteArt name={art} className="mx-auto block h-16 w-16" />
      <h2 className="mt-3 text-lg font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
