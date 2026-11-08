import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const songs = [
  { id: 1, link: "https://example.com/zvanets", slot: "startClass", note: "", title: "Хоро за междучасието", status: "approved", submitted_at: "2026-10-01T08:00:00Z", user_username: "мария_10б", votes: 12, has_voted: false },
  { id: 2, link: "https://example.com/utro", slot: "morning", note: "", title: "Ясно утро", status: "approved", submitted_at: "2026-10-03T08:00:00Z", user_username: "", votes: 4, has_voted: false },
];

async function pdfText(path: string) {
  const module = await import("pdfjs-dist/legacy/build/pdf.js");
  // The legacy build is CommonJS, so the API may sit under `default`.
  const pdfjs = ("getDocument" in module ? module : (module as { default: typeof module }).default);
  const document = await pdfjs.getDocument({ data: new Uint8Array(await readFile(path)) }).promise;
  const page = await document.getPage(1);
  const content = await page.getTextContent();
  return content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
}

test("the song suggestions PDF is written in Cyrillic", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "The PDF is the same on every viewport");
  await page.route("**/api/**", (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname.endsWith("/api/site-status/")) return route.fulfill({ json: { maintenance_mode: false, enable_bell_suggestions: true } });
    if (pathname.endsWith("/api/approved-songs/")) return route.fulfill({ json: songs });
    return route.fulfill({ json: route.request().method() === "POST" ? {} : [] });
  });
  await page.goto("/bell-suggest");
  await expect(page.getByRole("heading", { name: "Хоро за междучасието" })).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Експортирай предложенията в PDF" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("predlozheniya-zvunec.pdf");
  const path = testInfo.outputPath("songs.pdf");
  await file.saveAs(path);

  const text = await pdfText(path);
  for (const expected of ["Предложения за звънеца", "Предложена от", "Гласове", "Хоро за междучасието", "мария_10б", "изтрит потребител", "Отвори"]) {
    expect(text).toContain(expected);
  }
  expect(text).not.toContain("Predlozheniya");
});
