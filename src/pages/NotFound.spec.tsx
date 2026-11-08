import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import NotFound from "./NotFound";

const excuse = () => screen.getByRole("heading", { level: 1 }).parentElement!.querySelector("[aria-live]")!.textContent;

const renderPage = () => render(<MemoryRouter initialEntries={["/nyama-takava"]}><NotFound /></MemoryRouter>);

describe("NotFound", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("still says plainly which address does not exist and how to leave", () => {
    renderPage();
    expect(screen.getByText("/nyama-takava")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Назад" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Към началото" })).toHaveAttribute("href", "/");
  });

  it("picks the excuse at random", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const first = renderPage();
    const low = excuse();
    first.unmount();

    vi.spyOn(Math, "random").mockReturnValue(0.99);
    renderPage();
    expect(excuse()).not.toBe(low);
  });

  it("always changes the text when asked for another excuse", async () => {
    const user = userEvent.setup();
    renderPage();
    for (const random of [0, 0.5, 0.99]) {
      vi.spyOn(Math, "random").mockReturnValue(random);
      const before = excuse();
      await user.click(screen.getByRole("button", { name: "Друго оправдание" }));
      expect(excuse()).toBeTruthy();
      expect(excuse()).not.toBe(before);
    }
  });
});
