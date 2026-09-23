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

test('navigation and cookie notice fit a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.route('**/api/privacy-policy/', (route) => route.fulfill({ json: { date: '2026-09-23', content: 'Политика' } }));
  await page.goto('/faq');
  await expect(page.getByRole('heading', { name: /Често задавани въпроси/i })).toBeVisible();
  await page.getByRole('button', { name: 'Отвори менюто' }).click();
  await expect(page.locator('#mobile-navigation').getByRole('link', { name: 'Програма' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Само необходими' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Отказвам' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Приемам' })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    page: document.documentElement.scrollWidth,
  }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport);
});

test('contact form requires a reason before sending', async ({ page }) => {
  await page.goto('/contact');
  await page.getByPlaceholder('Вашето име').fill('Тест Потребител');
  await page.getByPlaceholder('Вашият имейл').fill('test@example.com');
  await page.getByPlaceholder('Напишете вашето съобщение тук.').fill('Въпрос относно училищния блог.');
  await page.getByRole('button', { name: 'Изпращане', exact: true }).click();
  await expect(page.getByText('Моля, изберете причина за контакт.')).toBeVisible();
});

test('program recovers from a loading error and remembers the selected class', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/program/', (route) => {
    attempts += 1;
    if (attempts === 1) return route.fulfill({ status: 503, json: { detail: 'Временно недостъпна' } });
    return route.fulfill({ json: {
      headers: ['Клас', 'Понеделник'],
      classes: ['9А', '10Б'],
      rows: [
        { 'Клас': '9А', 'Понеделник': 'Математика' },
        { 'Клас': '10Б', 'Понеделник': 'Физика' },
      ],
    } });
  });

  await page.goto('/program');
  await expect(page.getByRole('heading', { name: 'Програмата не може да се зареди' })).toBeVisible();
  await page.getByRole('button', { name: 'Опитай отново' }).click();
  await page.getByRole('combobox', { name: 'Изберете клас' }).click();
  await page.getByRole('option', { name: '10Б' }).click();
  await expect(page.getByRole('cell', { name: 'Физика' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Изберете клас' })).toContainText('10Б');
});
