import { expect, test } from "@playwright/test";

const photo = (id: number) => ({ id, image_url: `/gallery-test/original-${id}.svg`, display_url: `/gallery-test/display-${id}.svg`, thumbnail_url: `/gallery-test/thumb-${id}.svg`, title: `Кадър ${id}`, alt_text: `Училищен момент ${id}`, position: id, is_featured: false, focus_x: 50, focus_y: 50 });
const article = (id: number, title: string, date: string, gallery = [photo(id)]) => ({
  id, title, created_at: date, published_at: null, published: true, allowed: true, gallery, images: [], banner: "/social-preview.jpg", categories: [], category_name: "", author: 1, author_username: "Редактор", author_avatar_url: null, author_site_role: "student", author_equipped_rewards: [], hook: "Споделени моменти от училищния живот.", content: "Събитие в училище.", documents: [], views_this_month: 0,
});
const articles = [
  article(1, "Пролетен празник", "2025-04-12T10:00:00Z"),
  article(2, "Откриване на учебната година", "2026-09-15T10:00:00Z", [photo(20), photo(21), photo(22)]),
  article(3, "Спортен празник", "2026-05-12T10:00:00Z"),
  article(4, "Състезание по информатика", "2026-06-12T10:00:00Z"),
  article(5, "Новина без снимки", "2026-09-20T10:00:00Z", []),
  { ...article(6, "Непубликуван албум", "2026-09-21T10:00:00Z"), published: false },
  { ...article(7, "Стар албум", "2024-05-01T10:00:00Z", []), images: ["/gallery-test/original-7.svg"] },
];

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname.endsWith("/api/site-status/")) return route.fulfill({ json: { maintenance_mode: false, enable_bell_suggestions: true, enable_weekly_poll: true, enable_meme_of_the_week: true } });
    if (pathname.endsWith("/api/posts/")) return route.fulfill({ json: articles });
    const detail = pathname.match(/\/api\/posts\/(\d+)\/$/);
    if (detail) {
      const item = articles.find(({ id }) => id === Number(detail[1]));
      return route.fulfill({ status: item ? 200 : 404, json: item || {} });
    }
    if (pathname.endsWith("/api/privacy-policy/")) return route.fulfill({ json: { date: "2026-09-27", content: "Политика" } });
    return route.fulfill({ json: route.request().method() === "POST" ? {} : [] });
  });
  await page.route("**/gallery-test/*.svg", (route) => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#166b65"/><circle cx="400" cy="200" r="120" fill="#54baa4"/><path d="M0 600L260 220L560 600ZM320 600L630 280L800 600Z" fill="#103f48"/></svg>' }));
});

test("latest albums appear on home and Gallery is under More on phones and in the desktop header", async ({ page }) => {
  let postRequests = 0;
  page.on("request", (request) => { if (new URL(request.url()).pathname.endsWith("/api/posts/")) postRequests++; });
  await page.goto("/");
  await page.getByRole("button", { name: "Само необходими" }).click();
  const preview = page.locator("#home-gallery");
  await preview.scrollIntoViewIfNeeded();
  await expect(preview.locator("h3")).toHaveText(["Откриване на учебната година", "Състезание по информатика", "Спортен празник"]);
  expect(postRequests).toBe(1);

  await page.setViewportSize({ width: 375, height: 800 });
  const nav = page.getByRole("navigation", { name: "Основна навигация", exact: true });
  await expect(nav.getByRole("link", { name: "Галерия" })).toHaveCount(0);
  await nav.getByRole("button", { name: "Още" }).click();
  await page.getByRole("navigation", { name: "Още раздели" }).getByRole("link", { name: "Галерия" }).click();
  await expect(page).toHaveURL(/\/gallery$/);
  await expect(page.getByRole("heading", { name: "Галерия", exact: true })).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.getByRole("navigation", { name: "Горна навигация" }).getByRole("link", { name: "Галерия" }).click();
  await expect(page).toHaveURL(/\/gallery$/);
  await expect(page.getByRole("heading", { name: "Галерия", exact: true })).toBeVisible();
});

test("filters albums, opens photos with keyboard controls, and supports direct album links", async ({ page }, testInfo) => {
  const fullImageRequests: string[] = [];
  page.on("request", (request) => { if (request.url().includes("/gallery-test/display-")) fullImageRequests.push(request.url()); });
  await page.goto("/gallery");
  await page.getByRole("button", { name: "Само необходими" }).click();
  await expect(page.locator("main h3")).toHaveCount(5);
  await expect(page.getByRole("heading", { name: "Новина без снимки" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Непубликуван албум" })).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("gallery.png"), fullPage: true });
  await page.getByRole("combobox", { name: "Учебна година" }).click();
  await page.getByRole("option", { name: "2026/2027" }).click();
  await expect(page.locator("main h3")).toHaveCount(1);
  await page.getByLabel("Търси албум").fill("несъществуващо");
  await expect(page.getByRole("heading", { name: "Няма намерени албуми" })).toBeVisible();
  await page.getByRole("button", { name: "Изчисти филтрите" }).click();
  await page.getByLabel("Търси албум").fill("спортен");
  await page.reload();
  await expect(page.getByLabel("Търси албум")).toHaveValue("спортен");
  await expect(page.locator("main h3")).toHaveText(["Спортен празник"]);
  await page.goto("/gallery/2");
  await expect(page.getByRole("heading", { name: "Откриване на учебната година" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Към статията" })).toHaveAttribute("href", "/post/2");
  expect(fullImageRequests).toHaveLength(0);
  const opener = page.getByRole("button", { name: "Отвори снимка 1: Кадър 20", exact: true });
  await opener.click();
  await expect(page.getByRole("button", { name: "Затвори", exact: true })).toBeVisible();
  await expect(page.locator(".yarl__counter")).toHaveText("1 / 3");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".yarl__counter")).toHaveText("2 / 3");
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Откриване на учебната година" })).toBeVisible();
  await page.setViewportSize({ width: 375, height: 800 });
  await page.getByRole("navigation", { name: "Основна навигация", exact: true }).getByRole("button", { name: "Още" }).click();
  await expect(page.getByRole("navigation", { name: "Още раздели" }).getByRole("link", { name: "Галерия" })).toHaveAttribute("aria-current", "page");
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.getByRole("navigation", { name: "Горна навигация" }).getByRole("link", { name: "Галерия" })).toHaveAttribute("aria-current", "page");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("handles empty albums, removed articles and a recoverable loading error", async ({ page }) => {
  // The error state only appears after the query has used up its retries.
  test.slow();
  await page.goto("/gallery/5");
  await expect(page.getByRole("heading", { name: "Албумът не е наличен" })).toBeVisible();
  await page.goto("/gallery/999");
  await expect(page.getByRole("heading", { name: "Албумът не е наличен" })).toBeVisible();
  await page.route("**/api/posts/", (route) => route.fulfill({ status: 503, json: {} }));
  await page.goto("/gallery");
  await expect(page.getByRole("heading", { name: "Галерията не може да се зареди" })).toBeVisible({ timeout: 20000 });
  await page.route("**/api/posts/", (route) => route.fulfill({ json: [] }));
  await page.getByRole("button", { name: "Опитай отново" }).click();
  await expect(page.getByRole("heading", { name: "Все още няма албуми" })).toBeVisible();
});
