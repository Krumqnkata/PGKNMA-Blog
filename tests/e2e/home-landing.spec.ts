import { expect, test } from "@playwright/test";

const siteStatus = {
  maintenance_mode: false,
  enable_bell_suggestions: true,
  enable_weekly_poll: true,
  enable_meme_of_the_week: true,
  enable_user_registration: true,
  enable_program_page: true,
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/api/site-status/")) {
      await route.fulfill({ json: siteStatus });
      return;
    }
    if (route.request().method() === "POST") {
      await route.fulfill({ status: 201, json: {} });
      return;
    }
    await route.fulfill({ json: [] });
  });
});

test("home page follows the landing flow without horizontal overflow", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /Не просто следвай училищния живот/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Виж какво е новото/i })).toHaveAttribute(
    "href",
    "/news",
  );

  const sectionIds = ["home-hero", "home-news", "home-benefits", "home-final-cta"];
  for (const id of sectionIds) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }

  const orderedIds = await page.locator("main section[id]").evaluateAll((sections) =>
    sections.map((section) => section.id),
  );
  expect(orderedIds).toEqual(sectionIds);

  const benefits = page.locator("#home-benefits a");
  await expect(benefits).toHaveCount(3);

  await expect(page.getByRole("heading", { name: /Последни новини/i })).toBeAttached();
  await expect(page.getByRole("heading", { name: /Календар на училището/i })).toBeAttached();

  await page.locator("#home-final-cta").scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("link", { name: /Отвори последните новини/i }),
  ).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("hero video loads and retries on desktop and mobile", async ({ page }) => {
  let videoRequests = 0;
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.route("**/front-page-loop.webm*", async (route) => {
    videoRequests += 1;
    if (videoRequests === 1) {
      await route.fulfill({ status: 503, contentType: "text/plain", body: "Temporary error" });
      return;
    }
    await route.continue();
  });

  await page.goto("/");
  const video = page.locator("#home-hero video");
  await expect(video).toBeVisible();
  await expect(video.locator("source")).not.toHaveAttribute("media");
  await expect(video).not.toHaveAttribute("poster");
  await expect.poll(() => videoRequests, { timeout: 15_000 }).toBeGreaterThanOrEqual(2);
  await expect.poll(
    () => video.evaluate((element: HTMLVideoElement) => element.readyState),
    { timeout: 15_000 },
  ).toBeGreaterThanOrEqual(2);
  await expect.poll(
    () => video.evaluate((element: HTMLVideoElement) => element.paused),
    { timeout: 15_000 },
  ).toBe(false);
  await expect(video).toHaveJSProperty("loop", true);
});

test("reduced motion keeps the hero video visible and pauses it", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const hero = page.locator("#home-hero");
  const video = hero.locator("video");
  await expect(video).toBeVisible();
  await expect(hero.locator('img[src="/social-preview.jpg"]')).toHaveCount(0);
  await expect.poll(
    () => video.evaluate((element: HTMLVideoElement) => element.paused),
  ).toBe(true);
});
