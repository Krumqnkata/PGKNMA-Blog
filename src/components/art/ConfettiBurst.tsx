import type { CSSProperties } from "react";

const COLORS = ["#1fa394", "#f2b63f", "#e45a4e", "#4d96de", "#8f6de2", "#55b36b"];

/** Fixed positions, so the burst looks the same every time and in every test run. */
const PIECES = Array.from({ length: 14 }, (_, index) => ({
  // Two side bands, so the pieces never land on the text in the middle.
  left: (index % 2 === 0 ? 3 : 80) + ((index * 7) % 17),
  top: 8 + ((index * 23) % 70),
  rest: ((index * 53) % 90) - 45,
  spin: ((index * 97) % 360) - 540,
  delay: (index % 7) * 70,
  color: COLORS[index % COLORS.length],
  round: index % 3 === 0,
}));

/**
 * Paper confetti that falls once over its parent, which needs `relative` and `overflow-hidden`.
 * Pure decoration: hidden from screen readers, and resting in place when motion is reduced.
 */
export function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true" data-testid="confetti">
      {PIECES.map((piece, index) => (
        <span
          key={index}
          className={`confetti-piece absolute block ${piece.round ? "h-2 w-2 rounded-full" : "h-3 w-1.5 rounded-[1px]"}`}
          style={{
            left: `${piece.left}%`,
            top: `${piece.top}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}ms`,
            "--confetti-rest": `${piece.rest}deg`,
            "--confetti-spin": `${piece.spin}deg`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
