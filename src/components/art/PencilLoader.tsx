import { cn } from "@/lib/utils";

/**
 * A pencil writing on a ruled line, for full-page waits. The animation lives in index.css.
 * Without motion it rests at the end of a finished line, which still reads as "writing".
 */
export function PencilLoader({ className }: { className?: string }) {
  return (
    <svg viewBox="0 -8 140 68" className={cn("h-20 w-auto", className)} aria-hidden="true" focusable="false">
      <path d="M2 20h118M2 52h118" stroke="hsl(var(--border))" strokeWidth="1.5" strokeLinecap="round" />
      <path
        className="pencil-loader-line"
        d="M10 36q6.25-16 12.5 0t12.5 0 12.5 0 12.5 0 12.5 0 12.5 0 12.5 0 12.5 0"
        pathLength={1}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Drawn with the tip at 0,0, so moving the group moves the point that writes. */}
      <g className="pencil-loader-tip">
        <g transform="rotate(40)">
          <path d="M0 0-4.5-10h9Z" fill="#f7f1e3" />
          <path d="M0 0-1.6-3.6h3.2Z" fill="#3a4654" />
          <rect x="-4.5" y="-34" width="9" height="24" fill="#f2b63f" />
          <rect x="0" y="-34" width="4.5" height="24" fill="#c78a1e" />
          <rect x="-4.5" y="-38" width="9" height="4" fill="#d8ccb2" />
          <rect x="-4.5" y="-43" width="9" height="5.5" rx="2" fill="#e45a4e" />
        </g>
      </g>
    </svg>
  );
}
