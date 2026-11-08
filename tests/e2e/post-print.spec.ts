import { expect, test, type Page } from "@playwright/test";

const photo = (id: number, width = 800, height = 600, isFeatured = false) => ({
  id,
  image_url: `/print-test/original-${id}-${width}x${height}.svg`,
  display_url: `/print-test/display-${id}-${width}x${height}.svg`,
  thumbnail_url: `/print-test/thumb-${id}-${width}x${height}.svg`,
  title: `Кадър ${id}`,
  alt_text: `Училищен момент ${id}`,
  position: id,
  is_featured: isFeatured,
  focus_x: 50,
  focus_y: 50,
});

const paragraph = "Тази година гимназията посрещна гости от цялата област. Младежите показаха макети, чертежи и снимки от практиката си, а журито връчи награди на най-добрите отбори.";

const article = {
  id: 1,
  title: "Учениците представиха своите проекти на училищния празник",
  hook: "Споделени моменти от училищния живот и най-добрите идеи на годината.",
  content: [
    `## Как премина денят\n\n${paragraph}\n\n*Курсив:* вгджзийклптцшщю и **удебелен:** вгджзийклптцшщю.`,
    "![Снимка в текста](/print-test/inline-1-800x500.svg)",
    `> Цитат от директора: ${paragraph}`,
    "[Повече за събитието](https://example.com/sabitie)",
    "```python\nprint('здравей')\n```",
    ...Array.from({ length: 6 }, () => paragraph),
  ].join("\n\n"),
  banner: "/print-test/banner-1-1200x500.svg",
  categories: [{ id: 1, full_name: "Новини", short_name: "Н" }],
  category_name: "Новини",
  author: 1,
  author_username: "Редактор",
  author_avatar_url: null,
  author_site_role: "contributor",
  author_equipped_rewards: [],
  created_at: "2026-11-07T10:00:00Z",
  published_at: "2026-11-07T10:00:00Z",
  views_this_month: 12,
  published: true,
  allowed: true,
  images: [],
  gallery: [photo(1, 1200, 700, true), photo(2, 600, 800), photo(3), photo(4), photo(5)],
  documents: [{ id: 1, file_url: "/files/%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%B0.pdf", uploaded_at: "2026-11-07T10:00:00Z" }],
};

const openArticle = async (page: Page) => {
  await page.goto("/post/1");
  await page.getByRole("heading", { level: 1, name: article.title }).waitFor();
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname.endsWith("/api/site-status/")) return route.fulfill({ json: { maintenance_mode: false, enable_bell_suggestions: true, enable_weekly_poll: true, enable_meme_of_the_week: true } });
    if (pathname.endsWith("/api/posts/")) return route.fulfill({ json: [article] });
    if (/\/api\/posts\/1\/$/.test(pathname)) return route.fulfill({ json: article });
    return route.fulfill({ json: route.request().method() === "POST" ? {} : [] });
  });
  await page.route("**/print-test/*.svg", (route) => {
    const [, width, height] = /(\d+)x(\d+)\.svg$/.exec(route.request().url()) ?? [];
    return route.fulfill({
      contentType: "image/svg+xml",
      body: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="#166b65"/><circle cx="${Number(width) / 2}" cy="${Number(height) / 2}" r="${Number(height) / 3}" fill="#54baa4"/></svg>`,
    });
  });
  await page.addInitScript(() => {
    (window as unknown as { printCalls: number }).printCalls = 0;
    window.print = () => {
      (window as unknown as { printCalls: number }).printCalls += 1;
    };
  });
});

test("article text uses the reading font and headings use the heading font", async ({ page }) => {
  await openArticle(page);
  const family = (selector: string) => page.locator(selector).first().evaluate((element) => getComputedStyle(element).fontFamily);
  expect(await family("main h1")).toContain("Commissioner");
  expect(await family("main .prose p")).toContain("Source Serif 4");
  expect(await family("main .prose h2")).toContain("Commissioner");
  expect(await family("main time")).toContain("Sofia Sans");
});

test("does not download full-size gallery photos until printing is requested", async ({ page }) => {
  const fullSize: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/print-test/display-")) fullSize.push(request.url());
  });
  await openArticle(page);
  await page.waitForTimeout(500);
  expect(fullSize).toEqual([]);
  await expect(page.locator(".post-print-view")).toHaveCount(0);

  await page.getByRole("button", { name: "Принтирай" }).click();
  // Printing waits for images and web fonts for up to PRINT_ASSETS_TIMEOUT_MS (15s).
  await expect.poll(() => page.evaluate(() => (window as unknown as { printCalls: number }).printCalls), { timeout: 20_000 }).toBe(1);
  expect(fullSize).toHaveLength(article.gallery.length);

  const broken = await page.locator(".post-print-view img").evaluateAll((images) => (
    (images as HTMLImageElement[]).filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src)
  ));
  expect(broken).toEqual([]);
});

test("print media shows only the article, on white, in every theme", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "PDF output is the same across the viewport projects");

  for (const theme of ["light", "dark"] as const) {
    await openArticle(page);
    await page.evaluate((name) => document.documentElement.classList.toggle("dark", name === "dark"), theme);
    await page.getByRole("button", { name: "Принтирай" }).click();
    await expect(page.getByRole("button", { name: "Принтирай" })).toBeEnabled();

    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".post-print-view")).toBeVisible();
    await expect(page.locator("#root")).toBeHidden();
    await expect(page.locator(".post-print-view figure")).toHaveCount(article.gallery.length);

    const colors = await page.locator(".post-print-title").evaluate((element) => ({
      text: getComputedStyle(element).color,
      page: getComputedStyle(document.body).backgroundColor,
    }));
    expect(colors.page).toBe("rgb(255, 255, 255)");
    expect(colors.text).toBe("rgb(20, 20, 20)");

    await page.pdf({ path: testInfo.outputPath(`post-print-${theme}.pdf`), format: "A4", preferCSSPageSize: true });
    await page.emulateMedia({ media: "screen" });
  }
});

test("the dyslexia preference also reaches headings and article text", async ({ page }) => {
  await openArticle(page);
  await page.evaluate(() => document.documentElement.setAttribute("data-accessibility-dyslexia", "true"));
  const family = (selector: string) => page.locator(selector).first().evaluate((element) => getComputedStyle(element).fontFamily);
  expect(await family("main h1")).toContain("OpenDyslexic");
  expect(await family("main .prose p")).toContain("OpenDyslexic");
});
