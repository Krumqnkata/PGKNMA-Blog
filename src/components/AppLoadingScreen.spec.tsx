import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import AppLoadingScreen from "@/components/AppLoadingScreen";

describe("AppLoadingScreen", () => {
  afterEach(() => {
    vi.useRealTimers();
    window.history.pushState({}, "", "/");
  });

  it("names the page and what it is waiting for", () => {
    window.history.pushState({}, "", "/news");
    render(<AppLoadingScreen fullScreen={false} />);

    expect(screen.getByText("Отваряме „Новини“")).toBeInTheDocument();
    expect(screen.getByText("Изтегляне на страница „Новини“").closest("li")).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("Зареждане на публикациите")).toBeInTheDocument();
  });

  it("describes dynamic pages such as a single post", () => {
    window.history.pushState({}, "", "/post/42");
    render(<AppLoadingScreen fullScreen={false} />);

    expect(screen.getByText("Отваряме „Публикация“")).toBeInTheDocument();
    expect(screen.getByText("Зареждане на публикацията и коментарите")).toBeInTheDocument();
  });

  it("offers a reload when loading takes too long", () => {
    vi.useFakeTimers();
    render(<AppLoadingScreen fullScreen={false} />);

    expect(screen.queryByRole("button", { name: /презареди/i })).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(5_000));
    expect(screen.getByText(/връзката изглежда бавна/i)).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByRole("button", { name: /презареди страницата/i })).toBeInTheDocument();
  });
});
