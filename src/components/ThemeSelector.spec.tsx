import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ThemeSelector, { THEME_OPTIONS } from "./ThemeSelector";

const themeState = vi.hoisted(() => ({ theme: "dark" as string | undefined }));
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: themeState.theme, setTheme: vi.fn() }) }));

describe("ThemeSelector", () => {
  it("gives every theme its own drawing", () => {
    const drawings = THEME_OPTIONS.map((option) => option.art);
    expect(new Set(drawings).size).toBe(THEME_OPTIONS.length);
  });

  it("shows the current theme's drawing and keeps the accessible name", () => {
    themeState.theme = "dark";
    const { container, rerender } = render(<ThemeSelector />);
    const button = screen.getByRole("button", { name: "Избери цветова тема. Текуща: Тъмна" });
    const first = button.querySelector("svg.theme-art-swap");
    expect(first).toHaveAttribute("aria-hidden", "true");
    const darkDrawing = first?.innerHTML;

    themeState.theme = "light";
    rerender(<ThemeSelector />);
    expect(screen.getByRole("button", { name: "Избери цветова тема. Текуща: Светла" })).toBeInTheDocument();
    expect(container.querySelector("svg.theme-art-swap")?.innerHTML).not.toBe(darkDrawing);
  });
});
