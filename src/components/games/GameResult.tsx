import { useState } from "react";

import { SiteArt, type SiteArtName } from "@/components/art/SiteArt";
import type { GameSession } from "@/lib/games-api";
import { GAME_LINES, pickRandom } from "@/lib/playful-messages";

type FinishedStatus = Exclude<GameSession["status"], "active">;

const RESULTS: Record<FinishedStatus, { art: SiteArtName; title: string }> = {
  won: { art: "trophy", title: "Браво, реши задачата!" },
  lost: { art: "pencil", title: "Този опит приключи" },
  expired: { art: "schedule", title: "Времето на тази сесия изтече" },
};

const SPARKLES = [
  "left-[4%] top-[14%] size-3 [animation-delay:120ms]",
  "right-[6%] top-[12%] size-4 [animation-delay:300ms]",
  "right-[14%] bottom-[16%] size-2 [animation-delay:470ms]",
];

const pointsLine = ({ points_awarded: points, status }: GameSession) => {
  if (points > 0) return `Получаваш +${points} точки за своя напредък.`;
  return status === "won" ? "Победата е запазена. Този път няма допълнителни точки." : "Следващото предизвикателство те очаква.";
};

export default function GameResult({ session }: { session: GameSession }) {
  const status = session.status as FinishedStatus;
  const { art, title } = RESULTS[status];
  // Chosen once, so the joke does not change every time the board refreshes.
  const [joke] = useState(() => pickRandom(GAME_LINES[status]));

  return (
    <div role="status" className="relative overflow-hidden rounded-2xl bg-primary/10 p-5 text-center sm:p-6">
      {status === "won" && SPARKLES.map((position) => (
        <svg key={position} viewBox="0 0 24 24" className={`art-sparkle absolute text-amber-400 ${position}`} aria-hidden="true" focusable="false">
          <path d="M12 0c1.5 7 4 10.5 12 12-8 1.5-10.5 5-12 12-1.5-7-4-10.5-12-12 8-1.5 10.5-5 12-12Z" fill="currentColor" />
        </svg>
      ))}
      <SiteArt name={art} className="art-pop relative mx-auto block h-20 w-20 drop-shadow-sm" />
      <h2 className="relative mt-3 text-xl font-bold">{title}</h2>
      <p className="relative mt-1 font-semibold">{joke}</p>
      <p className="relative mt-2 text-sm">{pointsLine(session)}</p>
    </div>
  );
}
