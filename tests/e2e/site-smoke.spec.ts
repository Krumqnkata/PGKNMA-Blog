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

test('mobile navigation and header actions fit a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.route('**/api/privacy-policy/', (route) => route.fulfill({ json: { date: '2026-09-23', content: 'Политика' } }));
  await page.goto('/faq');
  await expect(page.getByRole('heading', { name: /Често задавани въпроси/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Само необходими' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Отказвам' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Приемам' })).toBeVisible();
  await page.getByRole('button', { name: 'Само необходими' }).click();

  const bottomNavigation = page.getByRole('navigation', { name: 'Основна навигация', exact: true });
  await expect(bottomNavigation.getByRole('link', { name: 'Програма' })).toBeVisible();
  await bottomNavigation.getByRole('link', { name: 'Програма' }).click();
  await expect(page).toHaveURL(/\/program$/);
  await bottomNavigation.getByRole('button', { name: 'Още' }).click();
  await expect(page.getByRole('navigation', { name: 'Още раздели' }).getByRole('link', { name: 'Седмична анкета' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Още раздели' }).getByRole('link', { name: 'Помощ и въпроси' }).click();
  await expect(page).toHaveURL(/\/faq$/);
  await page.getByRole('button', { name: 'Отвори настройки за достъпност' }).click();
  await expect(page.getByRole('heading', { name: 'Достъпност' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Избери цветова тема/ }).click();
  await expect(page.getByRole('menuitemradio', { name: /Тъмна/ })).toBeVisible();
  await page.keyboard.press('Escape');

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    page: document.documentElement.scrollWidth,
  }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport);
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(bottomNavigation).toBeVisible();
  await expect(bottomNavigation.getByRole('link', { name: 'Предложения за звънец' })).toBeVisible();
  await expect(bottomNavigation.getByRole('link', { name: 'Седмична анкета' })).toBeVisible();
});

test('navigation moves secondary sections into More as the viewport narrows', async ({ page }, testInfo) => {
  await page.route('**/api/privacy-policy/', (route) => route.fulfill({ json: { date: '2026-09-23', content: 'Политика' } }));
  await page.goto('/faq');
  await page.getByRole('button', { name: 'Само необходими' }).click();
  const navigation = page.getByRole('navigation', { name: 'Основна навигация', exact: true });
  const more = navigation.getByRole('button', { name: 'Още', exact: true });
  const extraSections = ['Предложения за звънец', 'Седмична анкета', 'Меме на седмицата'];
  const sizes: Array<{ width: number; font: number; icon: number }> = [];

  for (const width of [320, 375, 767, 768, 1024, 1279, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const visibleExtras = width >= 1280 ? 3 : width >= 768 ? 2 : 0;
    await expect(navigation.getByRole('link')).toHaveCount(4 + visibleExtras);
    for (const name of extraSections.slice(0, visibleExtras)) {
      await expect(navigation.getByRole('link', { name, exact: true })).toBeVisible();
    }
    const geometry = await navigation.evaluate((nav) => {
      const bounds = nav.getBoundingClientRect();
      const items = [...nav.querySelectorAll('a, button')];
      return {
        viewport: window.innerWidth,
        page: document.documentElement.scrollWidth,
        bottom: bounds.bottom,
        viewportHeight: window.innerHeight,
        fits: items.every((item) => {
          const rect = item.getBoundingClientRect();
          return rect.left >= 0 && rect.right <= window.innerWidth
            && item.scrollWidth <= item.clientWidth && item.scrollHeight <= item.clientHeight;
        }),
        font: parseFloat(getComputedStyle(items[0]).fontSize),
        icon: items[0].querySelector('svg')!.getBoundingClientRect().width,
      };
    });
    expect(geometry.page).toBeLessThanOrEqual(geometry.viewport);
    expect(geometry.fits).toBe(true);
    expect(geometry.bottom).toBeCloseTo(geometry.viewportHeight, 0);
    sizes.push({ width, font: geometry.font, icon: geometry.icon });
    if ([375, 768, 1280].includes(width)) {
      await page.screenshot({ path: testInfo.outputPath(`navigation-${width}.png`) });
    }
    await more.click();
    const overflow = page.getByRole('navigation', { name: 'Още раздели' });
    await expect(overflow.getByRole('link')).toHaveCount(5 - visibleExtras);
    for (const name of extraSections.slice(visibleExtras)) {
      await expect(overflow.getByRole('link', { name, exact: true })).toBeVisible();
    }
    await page.keyboard.press('Escape');
    await expect(more).toBeFocused();
  }
  expect(sizes.at(-1)!.font).toBeGreaterThan(sizes[0].font);
  expect(sizes.at(-1)!.icon).toBeGreaterThan(sizes[0].icon);

  await navigation.getByRole('link', { name: 'Предложения за звънец' }).click();
  await expect(page).toHaveURL(/\/bell-suggest$/);
  await expect(navigation.getByRole('link', { name: 'Предложения за звънец' })).toHaveAttribute('aria-current', 'page');
  await page.setViewportSize({ width: 375, height: 900 });
  await more.click();
  await expect(page.getByRole('navigation', { name: 'Още раздели' }).getByRole('link', { name: 'Предложения за звънец' })).toHaveAttribute('aria-current', 'page');
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.getByRole('navigation', { name: 'Още раздели' }).getByRole('link', { name: 'Предложения за звънец' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(more).toBeFocused();
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
