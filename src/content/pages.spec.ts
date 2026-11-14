import { describe, expect, it } from "vitest";

import appSource from "@/App.tsx?raw";
import { PAGE_DESCRIPTIONS, PAGE_TITLES, PAGES_WITHOUT_DESCRIPTION } from "@/content/pages";
import { buildSiteKnowledge } from "@/content/site-knowledge";

const staticRoutes = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((path) => !path.includes(":") && !PAGES_WITHOUT_DESCRIPTION.includes(path));

describe("site knowledge for the AI assistant", () => {
  it("describes every page in App.tsx, so the assistant knows about it", () => {
    expect(staticRoutes.length).toBeGreaterThan(10);
    for (const path of staticRoutes) {
      expect(PAGE_DESCRIPTIONS[path], `Липсва описание за ${path} в src/content/pages.ts`).toBeTruthy();
      expect(PAGE_TITLES[path], `Липсва заглавие за ${path} в src/content/pages.ts`).toBeTruthy();
    }
  });

  it("contains the frontend-only texts with valid links", () => {
    const knowledge = buildSiteKnowledge(new Date("2026-11-14T10:00:00Z"));
    const ids = knowledge.sections.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(expect.arrayContaining(["faq-01", "community-rules", "contact", "team", "minko-balkanski", "site-map"]));
    for (const section of knowledge.sections) {
      expect(section.text.trim().length).toBeGreaterThan(10);
      expect(section.url.startsWith("/") || section.url.startsWith("https://")).toBe(true);
    }
    const contact = knowledge.sections.find((section) => section.id === "contact");
    expect(contact?.text).toContain("+359 88 499 4500");
    expect(contact?.text).toContain("https://pgknma.com/priem");
  });

  it("does not give away the easter egg riddle", () => {
    const text = JSON.stringify(buildSiteKnowledge());
    expect(text).not.toContain("През коя година е роден");
    expect(text).not.toMatch(/роден\s+(?:през|на)\s+\d{4}/);
  });
});
