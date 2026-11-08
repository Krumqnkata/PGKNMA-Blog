import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { QueryEmptyState, QueryErrorState } from "./QueryStates";
import { ERROR_JOKES } from "@/lib/playful-messages";

describe("QueryErrorState", () => {
  it("adds a joke without hiding the real reason or the way to retry", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<QueryErrorState title="Новините не се заредиха" message="Сървърът не отговаря." onRetry={onRetry} />);

    const alert = screen.getByRole("alert");
    expect(ERROR_JOKES.some((joke) => alert.textContent?.includes(joke))).toBe(true);
    expect(screen.getByRole("heading", { name: "Новините не се заредиха" })).toBeInTheDocument();
    expect(screen.getByText("Сървърът не отговаря.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Опитай отново" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe("QueryEmptyState", () => {
  it("shows the next step when there is one", () => {
    render(<QueryEmptyState title="Нямате предложения"><a href="/bell-suggest">Предложи песен</a></QueryEmptyState>);
    expect(screen.getByRole("link", { name: "Предложи песен" })).toHaveAttribute("href", "/bell-suggest");
  });
});
