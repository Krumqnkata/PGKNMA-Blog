import { useId } from "react";

import { cn } from "@/lib/utils";

interface CookieArtProps {
  className?: string;
  /** A bite and crumbs for the main cookie; the plain one works as a small accent. */
  bitten?: boolean;
}

/** Decorative chocolate chip cookie. Its colours stay the same in every site theme. */
export function CookieArt({ className, bitten = false }: CookieArtProps) {
  const biteId = useId();

  return (
    <svg viewBox="0 0 64 64" className={cn("shrink-0", className)} aria-hidden="true" focusable="false">
      {bitten && (
        <mask id={biteId}>
          <rect width="64" height="64" fill="#fff" />
          <circle cx="56" cy="11" r="10" fill="#000" />
          <circle cx="47" cy="5" r="6" fill="#000" />
          <circle cx="62" cy="21" r="6" fill="#000" />
        </mask>
      )}
      <g mask={bitten ? `url(#${biteId})` : undefined}>
        <circle cx="32" cy="33" r="27" fill="#b9783a" />
        <circle cx="32" cy="31" r="27" fill="#e0a458" />
        <circle cx="29" cy="28" r="21" fill="#e9b672" opacity="0.55" />
        <circle cx="22" cy="21" r="4.5" fill="#5b3419" />
        <circle cx="40" cy="20" r="3.5" fill="#5b3419" />
        <circle cx="33" cy="33" r="4" fill="#5b3419" />
        <circle cx="17" cy="37" r="3.5" fill="#5b3419" />
        <circle cx="27" cy="48" r="4" fill="#5b3419" />
        <circle cx="43" cy="44" r="3.5" fill="#5b3419" />
        <circle cx="21" cy="20" r="1.3" fill="#83512b" />
        <circle cx="32" cy="32" r="1.3" fill="#83512b" />
      </g>
      {bitten && (
        <g fill="#c98f4b">
          <circle cx="60" cy="33" r="1.8" />
          <circle cx="55" cy="39" r="1.2" />
          <circle cx="61" cy="42" r="1" />
        </g>
      )}
    </svg>
  );
}
