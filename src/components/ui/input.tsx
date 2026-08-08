import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-input bg-card/70 px-3.5 py-2 text-base shadow-sm transition-[border-color,box-shadow,background-color] duration-200 file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-foreground placeholder:text-muted-foreground/80 hover:border-primary/35 focus-visible:border-primary/60 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:bg-muted/60 disabled:opacity-60 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/10 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
