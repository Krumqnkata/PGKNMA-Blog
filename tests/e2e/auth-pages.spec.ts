import { expect, test, type Page } from "@playwright/test";

const account = { id: 7, username: "test_uchenik", email: "test@example.com", first_name: "Тест", last_name: "Ученик", site_role: null, equipped_rewards: [] };
const article = {
  id: 1, title: "Училищен празник", hook: "Увод", content: "Текст.", banner: null, categories: [], category_name: "", author: 1, author_username: "Редактор", author_avatar_url: null, author_site_role: null, author_equipped_rewards: [],
  created_at: "2026-11-07T10:00:00Z", published_at: "2026-11-07T10:00:00Z", views_this_month: 1, published: true, allowed: true, images: [], gallery: [], documents: [],
};

const setup = async (page: Page, { registration = true } = {}) => {
  await page.route("**/api/**", (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname.endsWith("/api/site-status/")) return route.fulfill({ json: { maintenance_mode: false, enable_user_registration: registration, enable_program_page: true } });
    if (pathname.endsWith("/api/privacy-policy/")) return route.fulfill({ json: { date: "2026-09-23", content: "Политика" } });
    if (pathname.endsWith("/api/posts/")) return route.fulfill({ json: [article] });
    if (/\/api\/posts\/1\/$/.test(pathname)) return route.fulfill({ json: article });
    if (/\/token\/?$|\/login\/?$/.test(pathname) && route.request().method() === "POST") return route.fulfill({ json: { access: "test-access", refresh: "test-refresh", user: account } });
    if (pathname.endsWith("/api/profile/")) {
      return route.fulfill({ json: {
        user: account,
        avatar_options: { presets: [], max_upload_bytes: 5242880, output_size: 512, allowed_mime_types: ["image/png"] },
        public_profile: { bio: "", public_profile_enabled: true, show_email_on_profile: false, show_comments_on_profile: true },
      } });
    }
    if (pathname.endsWith("/api/gamification/profile/")) {
      return route.fulfill({ json: {
        points: 0, level: { number: 1, title: "Начинаещ", icon: "star", minimum_points: 0 }, next_level: null, progress_percent: 0, points_to_next: 0,
        leaderboard_opt_in: false, badges: [], recent_transactions: [], missions: [], rewards: [],
      } });
    }
    if (pathname.endsWith("/api/notifications/preferences/")) return route.fulfill({ json: {} });
    if (pathname.endsWith("/api/push/config/")) return route.fulfill({ json: { enabled: false } });
    return route.fulfill({ json: route.request().method() === "POST" ? {} : [] });
  });
  // Stands in for Cloudflare's widget, which cannot run in tests, and passes it immediately.
  await page.route("https://challenges.cloudflare.com/**", (route) => {
    const onload = new URL(route.request().url()).searchParams.get("onload");
    return route.fulfill({
      contentType: "text/javascript",
      body: `window.turnstile = {
        render: (el, options) => { setTimeout(() => options.callback("test-token")); return "widget"; },
        remove() {}, reset() {}, getResponse: () => "test-token", isExpired: () => false, execute() {}, ready: (callback) => callback(),
      };
      ${onload ? `window[${JSON.stringify(onload)}]?.();` : ""}`,
    });
  });
  await page.route("https://accounts.google.com/**", (route) => route.fulfill({ contentType: "text/javascript", body: "" }));
};

const signIn = async (scope: Page | ReturnType<Page["getByRole"]>) => {
  await scope.getByLabel("Потребителско име").fill("test_uchenik");
  await scope.getByLabel("Парола", { exact: true }).fill("test-password");
  const submit = scope.getByRole("button", { name: "Влез", exact: true });
  await expect(submit).toBeEnabled();
  await submit.click();
};

const signedInBefore = (page: Page) => page.addInitScript((user) => {
  localStorage.setItem("accessToken", "test-access");
  localStorage.setItem("refreshToken", "test-refresh");
  localStorage.setItem("user", JSON.stringify(user));
}, account);

test("signing in from a page comes back to that page", async ({ page }) => {
  await setup(page);
  await page.goto("/news?page=2");
  await page.getByRole("link", { name: "Вход в профила" }).click();
  await expect(page).toHaveURL(/\/login\?next=%2Fnews%3Fpage%3D2$/);
  await expect(page).toHaveTitle(/^Вход \|/);
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await signIn(page);
  await expect(page).toHaveURL(/\/news\?page=2$/);
  await expect(page.getByRole("link", { name: "Вход в профила" })).toHaveCount(0);
});

test("Enter in the password field submits the form", async ({ page }) => {
  await setup(page);
  await page.goto("/login");
  await page.getByLabel("Потребителско име").fill("test_uchenik");
  await page.getByLabel("Парола", { exact: true }).fill("test-password");
  await expect(page.getByRole("button", { name: "Влез", exact: true })).toBeEnabled();
  await page.getByLabel("Парола", { exact: true }).press("Enter");
  await expect(page).toHaveURL(/\/$/);
});

test("a protected page asks for sign-in and returns there", async ({ page }) => {
  await setup(page);
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login\?next=%2Fprofile$/);
  await signIn(page);
  await expect(page).toHaveURL(/\/profile$/);
});

test("the return address cannot lead to another site", async ({ page }) => {
  await setup(page);
  await signedInBefore(page);
  for (const next of ["//evil.example", "https://evil.example", "/%5Cevil.example"]) {
    await page.goto(`/login?next=${next}`);
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:5173\/$/);
  }
});

test("people who are already signed in skip both pages", async ({ page }) => {
  await setup(page);
  await signedInBefore(page);
  await page.goto("/login?next=%2Fnews");
  await expect(page).toHaveURL(/\/news$/);
  await page.goto("/register?next=%2Ffaq");
  await expect(page).toHaveURL(/\/faq$/);
});

test("the switch at the top moves between login and registration and keeps the return page", async ({ page }) => {
  await setup(page);
  await page.goto("/login?next=%2Fgames");
  const toggle = page.getByRole("navigation", { name: "Вход или регистрация" });
  await expect(toggle.getByRole("link", { name: "Вход", exact: true })).toHaveAttribute("aria-current", "page");
  // The switch replaces the old links at the bottom of both forms.
  await expect(page.getByRole("link", { name: "Регистрирай се!" })).toHaveCount(0);

  await toggle.getByRole("link", { name: "Регистрация", exact: true }).click();
  await expect(page).toHaveURL(/\/register\?next=%2Fgames$/);
  await expect(page).toHaveTitle(/^Регистрация \|/);
  await expect(page.getByRole("heading", { name: "Създай профил" })).toBeVisible();
  await expect(page.getByLabel("Имейл")).toBeVisible();
  await expect(toggle.getByRole("link", { name: "Регистрация", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("Вече имаш профил?")).toHaveCount(0);

  await toggle.getByRole("link", { name: "Вход", exact: true }).click();
  await expect(page).toHaveURL(/\/login\?next=%2Fgames$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/register\?next=%2Fgames$/);
});

test("the switch tile settles under the open tab, also without motion", async ({ page }) => {
  await setup(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [path, tab] of [["/login", "Вход"], ["/register", "Регистрация"]] as const) {
    await page.goto(path);
    const toggle = page.getByRole("navigation", { name: "Вход или регистрация" });
    await expect(toggle).toBeVisible();
    await page.waitForTimeout(100);
    const [tile, link] = await Promise.all([
      toggle.locator(".auth-switch-tile").boundingBox(),
      toggle.getByRole("link", { name: tab, exact: true }).boundingBox(),
    ]);
    expect(Math.abs(tile!.x - link!.x)).toBeLessThan(6);
  }
});

test("the session-expired dialog still offers registration", async ({ page }) => {
  await setup(page);
  await signedInBefore(page);
  await page.goto("/post/1");
  await page.getByPlaceholder("Напишете коментар...").waitFor();
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("auth:session-ended", { detail: { message: "Сесията изтече." } })));
  await expect(page.getByRole("dialog").getByRole("link", { name: "Регистрирай се!" })).toHaveAttribute("href", "/register?next=%2Fpost%2F1");
});

test("registration shows a notice when it is switched off", async ({ page }) => {
  await setup(page, { registration: false });
  await page.goto("/register");
  await expect(page.getByText("Регистрациите на нови потребители са временно изключени.")).toBeVisible();
  await expect(page.getByLabel("Имейл")).toHaveCount(0);
});

test("after confirming an email, signing in does not return to the confirmation page", async ({ page }) => {
  await setup(page);
  await page.goto("/verify-email?status=verified");
  await page.getByRole("main").getByRole("link", { name: "Вход в профила" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("both pages fit a narrow phone", async ({ page }, testInfo) => {
  await setup(page);
  await page.setViewportSize({ width: 320, height: 640 });
  for (const path of ["/login", "/register"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`auth${path.replace("/", "-")}-320.png`), fullPage: true });
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/login");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("auth-login-1280.png") });
});

test("an expired session asks to sign in without leaving the page or losing text", async ({ page }) => {
  await setup(page);
  await signedInBefore(page);
  await page.goto("/post/1");
  const draft = "Коментар, който не бива да се загуби";
  await page.getByPlaceholder("Напишете коментар...").fill(draft);

  await page.evaluate(() => window.dispatchEvent(new CustomEvent("auth:session-ended", { detail: { message: "Сесията изтече." } })));
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Сесията приключи" })).toBeVisible();
  await expect(page).toHaveURL(/\/post\/1$/);

  await signIn(dialog);
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/\/post\/1$/);
  await expect(page.getByPlaceholder("Напишете коментар...")).toHaveValue(draft);
});

test("an expired session on a protected page goes to the login page without a second form", async ({ page }) => {
  await setup(page);
  await signedInBefore(page);
  await page.goto("/profile");
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("auth:session-ended", { detail: { message: "Сесията изтече." } })));
  await expect(page).toHaveURL(/\/login\?next=%2Fprofile$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("link", { name: "Новини" }).first().click();
  await expect(page).toHaveURL(/\/news$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("signing out of the profile goes home, not to the login form", async ({ page }) => {
  await setup(page);
  await signedInBefore(page);
  await page.goto("/profile");
  await page.getByRole("button", { name: "Изход от профила" }).click();
  await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:5173\/$/);
  await expect(page.getByRole("link", { name: "Вход в профила" })).toBeVisible();
});

test("after registering, the first visit to the home page offers three first steps once", async ({ page }) => {
  await setup(page);
  await page.route("**/api/auth/check-username/**", (route) => route.fulfill({ json: { is_available: true } }));
  await page.route("**/api/auth/validate-password/", (route) => route.fulfill({ json: { is_valid: true } }));
  await page.route("**/api/auth/register/", (route) => route.fulfill({ json: { detail: "Изпратихме ти имейл за потвърждение.", email: account.email, verification_required: true } }));
  await page.goto("/register");
  await page.getByLabel("Имейл").fill(account.email);
  await page.getByLabel("Потребителско име").fill(account.username);
  await page.getByLabel("Име", { exact: true }).fill(account.first_name);
  await page.getByLabel("Фамилия").fill(account.last_name);
  await page.getByLabel("Парола", { exact: true }).fill("Silna-Parola-2026");
  await page.getByLabel("Потвърди паролата").fill("Silna-Parola-2026");
  await page.locator("form button[type=submit]").click();
  await expect(page.getByRole("heading", { name: "Потвърдете имейла си" })).toBeVisible();

  await page.getByRole("link", { name: "Към входа" }).click();
  await signIn(page);
  await expect(page).toHaveURL(/\/$/);
  const welcome = page.getByRole("region", { name: `Добре дошли в блога, ${account.username}!` });
  await expect(welcome).toBeVisible();
  await expect(welcome.getByRole("link", { name: /Предложи песен/ })).toHaveAttribute("href", "/bell-suggest");
  await welcome.getByRole("button", { name: "Разбрах" }).click();
  await expect(welcome).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("region", { name: /Добре дошли в блога/ })).toHaveCount(0);
});
