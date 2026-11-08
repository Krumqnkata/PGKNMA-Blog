import { chromium, type FullConfig } from "@playwright/test";

const routes = ["/", "/news", "/events", "/program", "/gallery", "/faq", "/contact", "/bell-suggest", "/weekly-poll", "/meme-of-the-week", "/games", "/gamification", "/post/1", "/login", "/register"];

/**
 * A freshly started Vite compiles each lazy route on first request. Parallel workers hitting
 * that cold server made unrelated tests time out at random, so compile the routes once first.
 */
export default async function warmUpDevServer(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL, serviceWorkers: "block" });
  await page.route("**/api/**", (route) => route.fulfill({ json: [] }));
  // Only the compiling matters here: a page that fails to settle must not stop the test run.
  for (const path of routes) {
    await page.goto(path, { waitUntil: "networkidle", timeout: 30_000 }).catch(() => undefined);
  }
  await browser.close();
}
