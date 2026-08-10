import { expect, test } from '@playwright/test';

const siteStatus = {
  maintenance_mode: false,
  enable_bell_suggestions: true,
  enable_weekly_poll: true,
  enable_meme_of_the_week: true,
  enable_user_registration: true,
  enable_program_page: true,
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/api/site-status/')) {
      await route.fulfill({ json: siteStatus });
      return;
    }
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 201, json: {} });
      return;
    }
    await route.fulfill({ json: [] });
  });
});

test('FAQ renders and the keyboard skip link reaches the main content', async ({ page }) => {
  await page.goto('/faq');

  await expect(page.getByRole('heading', { name: /Често задавани въпроси/i })).toBeVisible();
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: /Прескочи към съдържанието/i });
  await expect(skipLink).toBeFocused();
  await skipLink.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});
