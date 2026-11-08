import { expect, test, type Page } from "@playwright/test";

const user = { id: 21, username: "veseliyat_ucenik", email: "welcome@example.test", has_password: true, site_role: null, avatar_url: null, equipped_rewards: [] };

const question = {
  id: 5,
  title: "Какво отпечатва кодът?",
  subtitle: "Python",
  task_description: "print(2 + 3)",
  image_url: null,
  options: [
    { id: 51, key: "a", text: "5", image_url: null },
    { id: 52, key: "b", text: "23", image_url: null },
  ],
};

async function setup(page: Page, { signedIn = true } = {}) {
  if (signedIn) {
    await page.addInitScript((account) => {
      localStorage.setItem("accessToken", "welcome-token");
      localStorage.setItem("user", JSON.stringify(account));
    }, user);
  }
  await page.route("**/api/**", (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname.endsWith("/api/site-status/")) return route.fulfill({ json: { maintenance_mode: false, enable_weekly_poll: true, enable_bell_suggestions: true, enable_meme_of_the_week: true, enable_program_page: true } });
    if (pathname.endsWith("/api/profile/")) return route.fulfill({ json: { user } });
    if (pathname.endsWith("/api/privacy-policy/")) return route.fulfill({ json: { date: "2026-09-23", content: "Политика" } });
    if (pathname.endsWith("/api/push/config/")) return route.fulfill({ json: { enabled: false } });
    if (pathname.endsWith("/api/poll/status/")) return route.fulfill({ json: { is_locked: false, unlocks_at: null, question, last_result: null } });
    if (pathname.endsWith("/api/poll/statistics/")) return route.fulfill({ json: { total_participants: 0, total_answers: 0, correct_answers: 0, leaderboard: [] } });
    if (pathname.endsWith("/api/poll/submit/")) {
      const { selected_option: selected } = route.request().postDataJSON() as { selected_option?: number };
      const picked = question.options.find((option) => option.id === selected)?.key ?? "b";
      return route.fulfill({ json: { is_locked: true, unlocks_at: null, question, last_result: { questionId: question.id, selected: picked, correct: "a" } } });
    }
    return route.fulfill({ json: route.request().method() === "POST" ? {} : [] });
  });
}

async function dismissCookies(page: Page) {
  const button = page.getByRole("button", { name: "Само необходими" });
  await button.waitFor({ state: "visible", timeout: 3000 }).catch(() => {});
  if (await button.isVisible()) await button.click();
}

test("the home page greets a signed-in visitor by name", async ({ page }) => {
  await setup(page);
  await page.goto("/");
  await expect(page.getByText(/^(Добро утро|Добър ден|Добър вечер|Още будуваш), veseliyat_ucenik!$/)).toBeVisible();
  await expect(page.getByText("Официалният дигитален портал на ПГКНМА")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("guests keep the portal tagline", async ({ page }) => {
  await setup(page, { signedIn: false });
  await page.goto("/");
  await expect(page.getByText("Официалният дигитален портал на ПГКНМА")).toBeVisible();
});

test("the theme button shows a drawing of the chosen theme", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "The theme button lives in the desktop header");
  await setup(page, { signedIn: false });
  await page.goto("/");
  await dismissCookies(page);
  const button = page.getByRole("button", { name: /^Избери цветова тема/ });
  const drawing = () => button.locator("svg.theme-art-swap").innerHTML();

  await button.click();
  await page.getByRole("menuitemradio", { name: /Тъмна/ }).click();
  await expect(button).toHaveAccessibleName("Избери цветова тема. Текуща: Тъмна");
  const dark = await drawing();

  await button.click();
  await page.getByRole("menuitemradio", { name: /Горска/ }).click();
  await expect(button).toHaveAccessibleName("Избери цветова тема. Текуща: Горска");
  expect(await drawing()).not.toBe(dark);
});

test("the header buttons show drawings instead of plain icons", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Checks the full desktop header");
  await setup(page, { signedIn: false });
  await page.goto("/");
  const header = page.getByRole("banner");
  for (const control of [
    header.getByRole("button", { name: "Отвори глобалното търсене" }),
    header.getByRole("button", { name: "Отвори настройки за достъпност" }),
    header.getByRole("button", { name: "Известия" }),
    header.getByRole("link", { name: "Вход в профила" }),
  ]) {
    await expect(control.locator('svg[viewBox="0 0 64 64"]')).toBeVisible();
    await expect(control.locator("svg.lucide")).toHaveCount(0);
  }
});

test("a correct poll answer rains confetti and a wrong one names the right option", async ({ page }) => {
  await setup(page);
  await page.goto("/weekly-poll");
  await dismissCookies(page);
  await page.getByRole("radio").first().click();
  await page.getByRole("button", { name: "Изпрати" }).click();
  const moment = page.getByRole("status").filter({ hasText: "Браво, верен отговор!" });
  await expect(moment).toBeVisible();
  await expect(moment.getByTestId("confetti")).toBeAttached();

  await page.reload();
  await dismissCookies(page);
  await page.getByRole("radio").nth(1).click();
  await page.getByRole("button", { name: "Изпрати" }).click();
  const miss = page.getByRole("status").filter({ hasText: "Почти! Верен е вариант A." });
  await expect(miss).toBeVisible();
  await expect(miss.getByTestId("confetti")).toHaveCount(0);
});

test("a FAQ search with no match offers to ask directly", async ({ page }) => {
  await setup(page, { signedIn: false });
  await page.goto("/faq");
  await dismissCookies(page);
  await page.getByLabel("Търсене в често задаваните въпроси").fill("жирафи на покрива");
  await expect(page.getByRole("heading", { name: "Този въпрос още никой не го е задал" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "Питай ни" })).toHaveAttribute("href", "/contact");
});
