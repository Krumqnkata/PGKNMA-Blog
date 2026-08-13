import { screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";

import Index from "@/pages/Index";
import { renderWithProviders } from "@/test/render";

vi.mock("@/hooks/use-accessibility", () => ({
  useAccessibility: () => ({ reduceMotion: true }),
}));

vi.mock("@/lib/api", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/api")>(),
  getPosts: vi.fn().mockResolvedValue([]),
  getEvents: vi.fn().mockResolvedValue([]),
}));

describe("home landing page", () => {
  it("renders the required sections in the intended conversion order", async () => {
    const { container } = renderWithProviders(<Index />);
    const sectionIds = [
      "home-hero",
      "home-benefits",
      "home-final-cta",
    ];
    const sections = sectionIds.map((id) => container.querySelector(`#${id}`));

    sections.forEach((section) => expect(section).toBeInTheDocument());
    for (let index = 0; index < sections.length - 1; index += 1) {
      expect(
        sections[index]?.compareDocumentPosition(sections[index + 1] as Node)
        ?? 0,
      ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    }

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Не просто следвай училищния живот. Бъди част от него.",
    );
    expect(screen.getByRole("link", { name: /виж какво е новото/i })).toHaveAttribute(
      "href",
      "/news",
    );
    expect(screen.queryByText(/партньорства и признание/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    expect(screen.getByRole("heading", { name: /последни новини/i })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: /календар на училището/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /отвори последните новини/i })).toHaveAttribute(
      "href",
      "/news",
    );
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = renderWithProviders(<Index />);
    const results = await axe(container, {
      rules: {
        // jsdom cannot calculate the real theme-dependent colors.
        "color-contrast": { enabled: false },
      },
    });

    expect(results.violations).toEqual([]);
  });
});
