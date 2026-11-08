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
  await expect(bottomNavigation).toBeHidden();
  const headerNavigation = page.getByRole('navigation', { name: 'Горна навигация' });
  await expect(headerNavigation.getByRole('link', { name: 'Програма' })).toBeVisible();
  await headerNavigation.getByRole('button', { name: 'Още', exact: true }).click();
  await expect(page.getByRole('menuitem', { name: 'Предложения за звънец' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Седмична анкета' })).toBeVisible();
});

// `src/lib/site-navigation.ts` decides where each section goes. The bar switches at the
// 900px `lg` breakpoint: below it the bottom bar, from it the header.
const secondarySections = ['Предложения за звънец', 'Седмична анкета', 'Меме на седмицата', 'Игри', 'Мисии и награди', 'Помощ и въпроси', 'Контакт'];

test('below 900px the bottom bar keeps the main sections and the rest are under More', async ({ page }, testInfo) => {
  await page.route('**/api/privacy-policy/', (route) => route.fulfill({ json: { date: '2026-09-23', content: 'Политика' } }));
  await page.goto('/faq');
  await page.getByRole('button', { name: 'Само необходими' }).click();
  const navigation = page.getByRole('navigation', { name: 'Основна навигация', exact: true });
  const more = navigation.getByRole('button', { name: 'Още', exact: true });
  const sizes: Array<{ width: number; font: number; icon: number }> = [];

  for (const width of [320, 375, 767, 768, 899]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(navigation.getByRole('link')).toHaveText(['Начало', 'Новини', 'Събития', 'Програма']);
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
    if ([375, 768].includes(width)) {
      await page.screenshot({ path: testInfo.outputPath(`navigation-${width}.png`) });
    }
    await more.click();
    const overflow = page.getByRole('navigation', { name: 'Още раздели' });
    await expect(overflow.getByRole('link')).toHaveText(['Галерия', ...secondarySections]);
    await page.keyboard.press('Escape');
    await expect(more).toBeFocused();
  }
  expect(sizes.at(-1)!.font).toBeGreaterThan(sizes[0].font);
  // The icon clamp only starts growing above 1000px, where this bar is already hidden.
  expect(sizes.at(-1)!.icon).toBe(sizes[0].icon);

  await page.setViewportSize({ width: 375, height: 900 });
  await more.click();
  await page.getByRole('navigation', { name: 'Още раздели' }).getByRole('link', { name: 'Предложения за звънец' }).click();
  await expect(page).toHaveURL(/\/bell-suggest$/);
  await more.click();
  await expect(page.getByRole('navigation', { name: 'Още раздели' }).getByRole('link', { name: 'Предложения за звънец' })).toHaveAttribute('aria-current', 'page');
});

test('from 900px the header holds the navigation and the bottom bar is gone', async ({ page }, testInfo) => {
  await page.route('**/api/privacy-policy/', (route) => route.fulfill({ json: { date: '2026-09-23', content: 'Политика' } }));
  await page.goto('/faq');
  await page.getByRole('button', { name: 'Само необходими' }).click();
  const header = page.getByRole('navigation', { name: 'Горна навигация' });
  const more = header.getByRole('button', { name: 'Още', exact: true });

  for (const width of [900, 1024, 1279, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('navigation', { name: 'Основна навигация', exact: true })).toBeHidden();
    for (const name of ['Новини', 'Събития', 'Програма', 'Галерия']) {
      await expect(header.getByRole('link', { name, exact: true })).toBeVisible();
    }
    const geometry = await header.evaluate((nav) => {
      const links = nav.querySelector('ul')!.getBoundingClientRect();
      const actions = nav.querySelector('.site-header-actions')!.getBoundingClientRect();
      return {
        viewport: window.innerWidth,
        page: document.documentElement.scrollWidth,
        linksEnd: links.right,
        actionsStart: actions.left,
        actionsEnd: actions.right,
      };
    });
    expect(geometry.page).toBeLessThanOrEqual(geometry.viewport);
    expect(geometry.linksEnd).toBeLessThanOrEqual(geometry.actionsStart);
    expect(geometry.actionsEnd).toBeLessThanOrEqual(geometry.viewport);
    if ([1024, 1280].includes(width)) {
      await page.screenshot({ path: testInfo.outputPath(`navigation-${width}.png`) });
    }
    await more.click();
    await expect(page.getByRole('menu').getByRole('menuitem')).toHaveText(secondarySections);
    await page.keyboard.press('Escape');
    await expect(more).toBeFocused();
  }

  await more.click();
  await page.getByRole('menuitem', { name: 'Предложения за звънец' }).click();
  await expect(page).toHaveURL(/\/bell-suggest$/);
  await more.click();
  await expect(page.getByRole('menuitem', { name: 'Предложения за звънец' })).toHaveAttribute('aria-current', 'page');
});

test('the banner explains the cookies and the site sets none for analytics', async ({ page, context }, testInfo) => {
  await page.route('**/api/privacy-policy/', (route) => route.fulfill({ json: { date: '2026-09-23', content: 'Политика' } }));
  await page.goto('/faq', { waitUntil: 'networkidle' });

  const banner = page.getByRole('region', { name: 'Бисквитки' });
  await expect(banner).toContainText('Нямаме бисквитки за аналитика');
  // The banner's claim: nothing is stored as a cookie before the visitor chooses.
  expect((await context.cookies()).map(({ name }) => name)).toEqual([]);

  const details = banner.getByRole('button', { name: 'За какво са бисквитките?' });
  await expect(details).toHaveAttribute('aria-expanded', 'false');
  await details.click();
  await expect(details).toHaveAttribute('aria-expanded', 'true');
  await expect(banner.getByRole('heading', { name: 'Какво не ползваме' })).toBeVisible();
  await expect(banner.getByRole('link', { name: 'Политика за поверителност' })).toHaveAttribute('href', '/privacy-policy');

  for (const size of [{ width: 320, height: 568 }, { width: 375, height: 720 }, { width: 1280, height: 720 }]) {
    await page.setViewportSize(size);
    for (const name of ['Само необходими', 'Отказвам', 'Приемам']) {
      await expect(banner.getByRole('button', { name })).toBeInViewport({ ratio: 1 });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`cookie-banner-${size.width}.png`) });
  }

  await banner.getByRole('button', { name: 'Отказвам' }).click();
  await expect(banner).toHaveCount(0);
  expect((await context.cookies()).map(({ name }) => name)).toEqual(['cookieConsent']);
});

test('Google is contacted only after the visitor opens sign-in', async ({ page }) => {
  let googleRequests = 0;
  await page.route('https://accounts.google.com/**', (route) => {
    googleRequests += 1;
    return route.fulfill({ contentType: 'text/javascript', body: '' });
  });

  await page.goto('/faq', { waitUntil: 'networkidle' });
  await page.goto('/news', { waitUntil: 'networkidle' });
  expect(googleRequests).toBe(0);

  await page.getByRole('link', { name: 'Вход в профила' }).click();
  await expect(page).toHaveURL(/\/login\?next=%2Fnews$/);
  await expect.poll(() => googleRequests).toBeGreaterThan(0);
});

test('a sent contact message gets a lasting thank-you and the form can be used again', async ({ page }) => {
  await page.route('**/api/contact/', (route) => route.fulfill({ status: 201, json: { detail: 'Ще ви отговорим скоро.' } }));
  await page.goto('/contact');
  await page.getByPlaceholder('Вашето име').fill('Тест Потребител');
  await page.getByPlaceholder('Вашият имейл').fill('test@example.com');
  await page.getByPlaceholder('Напишете вашето съобщение тук.').fill('Въпрос относно училищния блог.');
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Общо запитване' }).click();
  await page.getByRole('button', { name: 'Изпращане', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Съобщението ти е при нас!' })).toBeFocused();
  await expect(page.getByText('Ще ви отговорим скоро.')).toBeVisible();
  await page.getByRole('button', { name: 'Изпрати още едно съобщение' }).click();
  await expect(page.getByPlaceholder('Вашето име')).toHaveValue('');
});

test('the 404 page offers a new excuse and a way back', async ({ page }) => {
  await page.goto('/nyama-takava');
  await expect(page.getByRole('heading', { name: 'Тази страница отсъства' })).toBeVisible();
  const excuse = page.locator('main [aria-live="polite"]');
  const first = await excuse.textContent();
  await page.getByRole('button', { name: 'Друго оправдание' }).click();
  await expect(excuse).not.toHaveText(first!);
  await page.getByRole('link', { name: 'Към началото' }).click();
  await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:5173\/$/);
});

test('the loading pencil stays on its line while it writes', async ({ page }) => {
  await page.route(/\/src\/pages\/FAQ\.tsx/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    await route.continue();
  });
  await page.goto('/faq');
  const tip = page.locator('.pencil-loader-tip');
  await expect(tip).toBeVisible();

  // The animation is paused at chosen moments, so this reads exact positions.
  const positionAt = (time: number) => tip.evaluate((element, at) => {
    const [animation] = element.getAnimations();
    animation.pause();
    animation.currentTime = at;
    const { e, f } = new DOMMatrix(getComputedStyle(element).transform);
    return { x: e, y: f };
  }, time);
  expect(await positionAt(0)).toEqual({ x: 10, y: 36 });
  expect(await positionAt(1040)).toEqual({ x: 60, y: 36 });
  expect(await positionAt(2340)).toEqual({ x: 110, y: 36 });
});

test('losing the connection is announced with what stops working', async ({ page, context }) => {
  await page.goto('/faq');
  await expect(page.getByRole('heading', { name: /Често задавани въпроси/i })).toBeVisible();
  await context.setOffline(true);
  await expect(page.getByRole('heading', { name: 'Някой извади щепсела' })).toBeVisible();
  await expect(page.getByText(/гласуването, коментирането и изпращането на форми са временно недостъпни/)).toBeVisible();
  await context.setOffline(false);
  await expect(page.getByRole('heading', { name: 'Връзката е възстановена!' })).toBeVisible();
});

test('the rocket button goes back to the top of the page', async ({ page }) => {
  await page.route('**/api/privacy-policy/', (route) => route.fulfill({ json: { date: '2026-09-23', content: 'Политика' } }));
  await page.goto('/faq');
  await expect(page.getByRole('heading', { name: /Често задавани въпроси/i })).toBeVisible();
  await page.getByRole('button', { name: 'Само необходими' }).click();
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
  const rocket = page.getByRole('button', { name: 'Нагоре към началото на страницата' });
  await expect(rocket.locator('svg')).toHaveCSS('width', '36px');
  await rocket.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(rocket).toHaveCount(0);
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
