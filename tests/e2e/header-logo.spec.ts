import { expect, test } from '@playwright/test';

const PNG_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

const headerLogo = {
  image_url: '/files/header-logos/budit.gif',
  static_image_url: '/files/header-logos/still/budit-still.png',
  greeting: 'Честит Ден на народните будители!',
  alt: 'Честит Ден на народните будители!',
  effect: 'leaves',
};

const mockApi = async (page: import('@playwright/test').Page, logo: typeof headerLogo | null) => {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/api/site-status/')) {
      await route.fulfill({
        json: {
          maintenance_mode: false,
          enable_bell_suggestions: true,
          enable_weekly_poll: true,
          enable_meme_of_the_week: true,
          enable_user_registration: true,
          enable_program_page: true,
          header_logo: logo,
        },
      });
      return;
    }
    await route.fulfill({ json: [] });
  });
};

const homeLink = (page: import('@playwright/test').Page) =>
  page.getByRole('navigation', { name: 'Горна навигация' }).getByRole('link', { name: /ПГКНМА Блог — начало/ });

test('header shows the holiday logo, greeting and effect from site status', async ({ page }) => {
  await mockApi(page, headerLogo);
  await page.route('**/files/header-logos/**', (route) => route.fulfill({ contentType: 'image/png', body: PNG_PIXEL }));
  await page.goto('/faq');

  const link = homeLink(page);
  await expect(link).toHaveAccessibleName(`ПГКНМА Блог — начало. ${headerLogo.greeting}`);
  await expect(link).toHaveAttribute('title', headerLogo.greeting);
  await expect(link.locator('img')).toHaveAttribute('src', headerLogo.image_url);
  await expect(page.locator('header canvas')).toHaveCount(1);
});

test('the greeting is visible on phones as a strip and under the logo on wide screens', async ({ page }) => {
  await mockApi(page, headerLogo);
  await page.route('**/files/header-logos/**', (route) => route.fulfill({ contentType: 'image/png', body: PNG_PIXEL }));
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/faq');

  const strip = page.locator('header .site-header-greeting');
  await expect(strip).toBeVisible();
  await expect(strip).toHaveText(headerLogo.greeting);
  await expect(page.locator('header canvas')).toHaveCount(1);
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(fits).toBe(true);

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(strip).toBeHidden();
  await expect(homeLink(page).getByText(headerLogo.greeting)).toBeVisible();
});

test('reduced motion uses the still frame and skips the effect', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockApi(page, headerLogo);
  await page.route('**/files/header-logos/**', (route) => route.fulfill({ contentType: 'image/png', body: PNG_PIXEL }));
  await page.goto('/faq');

  await expect(homeLink(page).locator('img')).toHaveAttribute('src', headerLogo.static_image_url);
  await expect(page.locator('header canvas')).toHaveCount(0);
});

test('a broken holiday image falls back to the default logo', async ({ page }) => {
  await mockApi(page, { ...headerLogo, effect: 'none' });
  await page.route('**/files/header-logos/**', (route) => route.fulfill({ status: 404, body: '' }));
  await page.goto('/faq');

  await expect(homeLink(page).locator('img')).toHaveAttribute('src', /logo-dark\.png$/);
});

test('without a holiday logo the header keeps the default logo', async ({ page }) => {
  await mockApi(page, null);
  await page.goto('/faq');

  await expect(homeLink(page)).toHaveAccessibleName('ПГКНМА Блог — начало');
  await expect(homeLink(page).locator('img')).toHaveAttribute('src', /logo-dark\.png$/);
  await expect(page.locator('header canvas')).toHaveCount(0);
});
