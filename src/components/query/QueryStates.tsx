import type { LucideIcon } from "lucide-react";
import { AlertCircle, Inbox, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
        <Skeleton className="h-10 w-4/5" /><Skeleton className="h-5 w-2/5" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  return (
    <div role="status" aria-label={label} className={`${variant === "cards" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"} ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-xl border bg-card p-4">
          {variant === "cards" && <Skeleton className="mb-4 aspect-video w-full rounded-lg" />}
          <div className="space-y-3"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-1/2" /></div>
        </div>
      ))}
      <span className="sr-only">{label}</span>
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
  return (
    <div role="alert" className={`rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center ${className}`}>
      <AlertCircle className="mx-auto h-9 w-9 text-destructive" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-semibold">{title}</h2>
      {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
      {onRetry && <Button type="button" variant="outline" className="mt-4" onClick={onRetry}><RefreshCw className="h-4 w-4" aria-hidden="true" />Опитай отново</Button>}
    </div>
  );
}

interface QueryEmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

export function QueryEmptyState({ title, description, icon: Icon = Inbox, className = "" }: QueryEmptyStateProps) {
  return (
    <div className={`rounded-xl border-2 border-dashed p-8 text-center ${className}`}>
      <Icon className="mx-auto h-10 w-10 text-muted-foreground/60" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
