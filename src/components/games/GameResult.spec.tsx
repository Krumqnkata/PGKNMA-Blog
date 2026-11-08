import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import GameResult from "./GameResult";
import type { GameSession } from "@/lib/games-api";
import { GAME_LINES } from "@/lib/playful-messages";

const session = (status: GameSession["status"], points = 0) => ({ id: "1", status, points_awarded: points }) as GameSession;

describe("GameResult", () => {
  it.each([
    ["won", "Браво, реши задачата!"],
    ["lost", "Този опит приключи"],
    ["expired", "Времето на тази сесия изтече"],
  ] as const)("names the %s outcome and adds a joke about it", (status, title) => {
    render(<GameResult session={session(status)} />);
    const result = screen.getByRole("status");
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    expect(GAME_LINES[status].some((line) => result.textContent?.includes(line))).toBe(true);
  });

  it("still states the points that were won", () => {
    render(<GameResult session={session("won", 5)} />);
    expect(screen.getByText("Получаваш +5 точки за своя напредък.")).toBeInTheDocument();
  });

  it("says when a win brings no extra points", () => {
    render(<GameResult session={session("won")} />);
    expect(screen.getByText("Победата е запазена. Този път няма допълнителни точки.")).toBeInTheDocument();
  });

  it("keeps the same joke when the board refreshes", () => {
    const { rerender } = render(<GameResult session={session("lost")} />);
    const before = screen.getByRole("status").textContent;
    for (let index = 0; index < 20; index += 1) rerender(<GameResult session={session("lost")} />);
    expect(screen.getByRole("status").textContent).toBe(before);
  });
});
