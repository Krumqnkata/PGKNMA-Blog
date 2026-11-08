import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import WelcomeCard from "./WelcomeCard";
import { markWelcomePending } from "@/lib/welcome";

const auth = vi.hoisted(() => ({ user: null as null | { id: number; username: string } }));
vi.mock("@/hooks/use-auth", () => ({ useAuth: () => auth }));

const renderCard = () => render(<MemoryRouter><WelcomeCard /></MemoryRouter>);

describe("WelcomeCard", () => {
  beforeEach(() => {
    window.localStorage.clear();
    auth.user = { id: 1, username: "nova_uchenichka" };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("greets a newly registered user with three first steps", () => {
    markWelcomePending();
    renderCard();
    expect(screen.getByRole("heading", { name: "Добре дошли в блога, nova_uchenichka!" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Предложи песен/ })).toHaveAttribute("href", "/bell-suggest");
    expect(screen.getByRole("link", { name: /Изиграй игра/ })).toHaveAttribute("href", "/games");
    expect(screen.getByRole("link", { name: /Реши задачата на седмицата/ })).toHaveAttribute("href", "/weekly-poll");
  });

  it("goes away for good after „Разбрах“", () => {
    markWelcomePending();
    const { unmount } = renderCard();
    fireEvent.click(screen.getByRole("button", { name: "Разбрах" }));
    expect(screen.queryByRole("heading", { name: /Добре дошли/ })).not.toBeInTheDocument();
    unmount();
    renderCard();
    expect(screen.queryByRole("heading", { name: /Добре дошли/ })).not.toBeInTheDocument();
  });

  it("stays hidden for guests and for people who did not just register", () => {
    renderCard();
    expect(screen.queryByRole("heading", { name: /Добре дошли/ })).not.toBeInTheDocument();
    markWelcomePending();
    auth.user = null;
    renderCard();
    expect(screen.queryByRole("heading", { name: /Добре дошли/ })).not.toBeInTheDocument();
  });

  it("does not break when browser storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    expect(() => renderCard()).not.toThrow();
    expect(screen.queryByRole("heading", { name: /Добре дошли/ })).not.toBeInTheDocument();
  });
});
