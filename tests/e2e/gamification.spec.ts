import { expect, test } from '@playwright/test';

const user = { id: 17, username: 'school_reader', email: 'reader@example.test', has_password: true, site_role: null, avatar_url: null, equipped_rewards: [] };
const progress = {
  points: 125,
  level: { number: 2, title: 'Активен участник', icon: 'star', minimum_points: 100 },
  next_level: { number: 3, title: 'Вдъхновител', icon: 'star', minimum_points: 200 },
  progress_percent: 25, points_to_next: 75, leaderboard_opt_in: true,
  badges: [], recent_transactions: [], missions: [], rewards: [],
};
const catalogBadge = {
  slug: 'reader', title: 'Любознателен читател', description: 'Откривай нови истории.',
  icon: 'book-open', rarity: 'rare', points_reward: 15,
  condition: 'Прочетена публикация: 7 действия с начислени точки.', ends_at: null,
};
const catalog = {
  levels: [
    { number: 1, title: 'Новак', icon: 'sprout', minimum_points: 0 },
    { number: 2, title: 'Участник', icon: 'star', minimum_points: 100 },
    { number: 5, title: 'Вдъхновител', icon: 'trophy', minimum_points: 250 },
  ],
  point_rules: [
    { action: 'comment', title: 'Валиден коментар', points: 13, daily_limit: 3, active: true, note: 'За нов коментар.' },
    { action: 'post_read', title: 'Прочетена публикация', points: 2, daily_limit: null, active: true, note: 'След поне 15 секунди четене.' },
    { action: 'poll_vote', title: 'Гласуване в анкета', points: 5, daily_limit: null, active: true, note: 'При отговор в анкета.' },
    { action: 'song_approved', title: 'Одобрена песен', points: 20, daily_limit: 0, active: false, note: 'Разделът временно е изключен.' },
  ],
  badges: [catalogBadge],
  rewards: [
    { key: 'reader-frame', title: 'Рамка на читателя', kind: 'avatar_frame', config: { color: '#8b5cf6', style: 'glow' }, badges: [catalogBadge] },
    { key: 'reader-title', title: 'Титла на читателя', kind: 'user_title', config: { text: 'Изследовател', color: '#8b5cf6' }, badges: [catalogBadge] },
    { key: 'reader-theme', title: 'Тема на читателя', kind: 'profile_theme', config: { color: '#8b5cf6', secondary_color: '#22d3ee' }, badges: [catalogBadge] },
    { key: 'reader-border', title: 'Профилна рамка на читателя', kind: 'profile_border', config: { color: '#8b5cf6', style: 'gradient' }, badges: [catalogBadge] },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/api/site-status/')) return route.fulfill({ json: { maintenance_mode: false, enable_weekly_poll: true, enable_bell_suggestions: false, enable_meme_of_the_week: false } });
    if (path.endsWith('/api/profile/')) return route.fulfill({ json: { user } });
    if (path.endsWith('/api/gamification/catalog/')) return route.fulfill({ json: catalog });
    if (path.endsWith('/api/gamification/profile/')) return route.fulfill({ json: progress });
    if (path.endsWith('/api/gamification/leaderboard/')) return route.fulfill({ json: {
      weekly: { top: [{ ...user, username: 'weekly_leader', rank: 1, points: 50 }], current_user: route.request().headers().authorization ? { ...user, rank: 17, points: 25 } : null },
      monthly: { top: [], current_user: null },
      all_time: { top: [{ ...user, username: 'overall_leader', rank: 1, points: 500 }], current_user: route.request().headers().authorization ? { ...user, rank: 23, points: 125 } : null },
    } });
    if (path.endsWith('/api/privacy-policy/')) return route.fulfill({ json: { date: '2026-09-23', content: 'Политика' } });
    if (path.endsWith('/api/push/config/')) return route.fulfill({ json: { enabled: false } });
    return route.fulfill({ json: [] });
  });
});

test('guests can discover the page and open login without requesting private progress', async ({ page }, testInfo) => {
  const privateRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/gamification/profile/')) privateRequests.push(request.url());
  });
  await page.setViewportSize({ width: testInfo.project.name === 'chromium' ? 1440 : 320, height: 900 });
  await page.goto('/gamification');
  await page.getByRole('button', { name: 'Само необходими' }).click();
  await expect(page).toHaveTitle('Мисии и награди | ПГКНМА Блог');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Мисии, награди');
  await expect(page.getByRole('link', { name: 'weekly_leader', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Към анкетата', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Предложи песен', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Как работи?', exact: true }).click();
  await expect(page).toHaveURL(/#how-it-works$/);
  await page.getByRole('button', { name: 'Задължително ли е да участвам в класацията?' }).click();
  await expect(page.getByText(/Не. Публичното участие е по избор/)).toBeVisible();
  expect(privateRequests).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('gamification-guest.png'), fullPage: true });
  await page.getByRole('button', { name: 'Влез в профила си', exact: true }).click();
  await expect(page).toHaveURL(/\/login\?next=%2Fgamification/);
  await expect(page.getByRole('heading', { name: 'Добре дошли' })).toBeVisible();
});

test('signed-in readers see their rank outside the top ten and can switch periods', async ({ page }, testInfo) => {
  await page.addInitScript((account) => {
    localStorage.setItem('accessToken', 'gamification-test-token');
    localStorage.setItem('user', JSON.stringify(account));
  }, user);
  await page.setViewportSize({ width: testInfo.project.name === 'chromium' ? 1440 : 320, height: 900 });
  await page.goto('/gamification');
  await page.getByRole('button', { name: 'Само необходими' }).click();
  await page.getByRole('link', { name: 'Виж моето място', exact: true }).click();
  const statistics = page.getByRole('region', { name: 'Твоята статистика' });
  await expect(statistics.getByText('125', { exact: true })).toBeVisible();
  await expect(statistics.getByText('№ 17', { exact: true })).toBeVisible();
  await expect(statistics.getByText('25', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Моите значки' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Моите дигитални награди' })).toHaveCount(0);
  await expect(statistics.getByRole('link', { name: 'Моят прогрес в профила' })).toHaveAttribute('href', '/profile?tab=progress');
  await page.getByRole('tab', { name: 'Месец', exact: true }).click();
  await expect(page.getByText('Все още няма участници с точки за този период.')).toBeVisible();
  await expect(statistics.getByText('—', { exact: true })).toHaveCount(2);
  await expect(statistics.getByText(/Все още нямаш място/)).toBeVisible();
  await page.getByRole('tab', { name: 'Общо', exact: true }).click();
  await expect(page.getByRole('link', { name: 'overall_leader', exact: true })).toBeVisible();
  await expect(statistics.getByText('№ 23', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('gamification-progress.png'), fullPage: true });
  await page.setViewportSize({ width: 375, height: 800 });
  await page.getByRole('navigation', { name: 'Основна навигация', exact: true }).getByRole('button', { name: 'Още', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Още раздели' }).getByRole('link', { name: 'Мисии и награди' })).toHaveAttribute('aria-current', 'page');
});

test('readers who opted out see their total and an explanation instead of a rank', async ({ page }) => {
  await page.addInitScript((account) => {
    localStorage.setItem('accessToken', 'gamification-test-token');
    localStorage.setItem('user', JSON.stringify(account));
  }, user);
  await page.route('**/api/gamification/profile/', (route) => route.fulfill({ json: { ...progress, leaderboard_opt_in: false } }));
  await page.route('**/api/gamification/leaderboard/', (route) => route.fulfill({ json: {
    weekly: { top: [], current_user: null }, monthly: { top: [], current_user: null }, all_time: { top: [], current_user: null },
  } }));
  await page.goto('/gamification');
  await page.getByRole('button', { name: 'Само необходими' }).click();
  const statistics = page.getByRole('region', { name: 'Твоята статистика' });
  await expect(statistics.getByText('125', { exact: true })).toBeVisible();
  await expect(statistics.getByText('—', { exact: true })).toHaveCount(2);
  await expect(statistics.getByText(/В момента не участваш в публичната класация/)).toBeVisible();
});

test('a failed public leaderboard can be retried', async ({ page }) => {
  let failing = true;
  await page.route('**/api/gamification/leaderboard/', (route) => failing
    ? route.fulfill({ status: 503, json: { detail: 'Временна грешка' } })
    : route.fulfill({ json: { weekly: { top: [{ ...user, rank: 1, points: 125 }], current_user: null }, monthly: { top: [], current_user: null }, all_time: { top: [], current_user: null } } }));
  await page.goto('/gamification');
  await page.getByRole('button', { name: 'Само необходими' }).click();
  await expect(page.getByRole('heading', { name: 'Класацията не може да бъде заредена' })).toBeVisible({ timeout: 15000 });
  failing = false;
  await page.getByRole('button', { name: 'Опитай отново', exact: true }).click();
  await expect(page.getByRole('link', { name: 'school_reader', exact: true })).toBeVisible();
});

test('live rules and reward previews are public, filterable and read-only', async ({ page }, testInfo) => {
  const mutations: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/gamification/') && request.method() !== 'GET') mutations.push(request.url());
  });
  await page.setViewportSize({ width: testInfo.project.name === 'chromium' ? 1440 : 320, height: 900 });
  await page.goto('/gamification');
  await page.getByRole('button', { name: 'Само необходими' }).click();
  await expect(page.getByText('Общо 3 нива', { exact: true })).toBeVisible();
  const levels = page.getByRole('list', { name: 'Всички нива' });
  await expect(levels.getByRole('listitem')).toHaveCount(3);
  await expect(levels.getByRole('listitem').last()).toContainText('Ниво 5');
  await expect(levels.getByRole('listitem').last()).toContainText('От 250 точки');
  await expect(levels.getByRole('listitem').last()).toContainText('Най-високо ниво');
  const rules = page.getByRole('table', { name: 'Правила за печелене на точки' });
  const comment = rules.getByRole('row').filter({ hasText: 'Валиден коментар' });
  await expect(comment.getByRole('cell', { name: '+13', exact: true })).toBeVisible();
  await expect(comment.getByRole('cell', { name: '3 на ден', exact: true })).toBeVisible();
  await expect(rules.getByRole('row').filter({ hasText: 'Прочетена публикация' }).getByText('Без дневен лимит')).toBeVisible();
  await expect(rules.getByRole('row').filter({ hasText: 'Одобрена песен' }).getByText('Неактивно')).toBeVisible();
  const filters = page.getByRole('group', { name: 'Вид награда' });
  await filters.getByRole('button', { name: 'Рамки за аватар', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Рамка на читателя', exact: true })).toBeVisible();
  await expect(page.getByText(catalogBadge.condition, { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Титла на читателя', exact: true })).toHaveCount(0);
  await filters.getByRole('button', { name: 'Титли', exact: true }).click();
  await expect(page.getByText('Изследовател', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Използвай наградата', exact: true })).toHaveCount(0);
  await filters.getByRole('button', { name: 'Икони', exact: true }).click();
  await expect(page.getByText('В момента няма налични награди в тази категория.')).toBeVisible();
  await filters.getByRole('button', { name: 'Всички', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('gamification-catalog.png'), fullPage: true });
  expect(mutations).toEqual([]);
});

test('unavailable catalog does not invent point values and can recover', async ({ page }) => {
  let failing = true;
  await page.route('**/api/gamification/catalog/', (route) => failing
    ? route.fulfill({ status: 503, json: { detail: 'Временна грешка' } })
    : route.fulfill({ json: catalog }));
  await page.goto('/gamification');
  await page.getByRole('button', { name: 'Само необходими' }).click();
  await expect(page.getByRole('heading', { name: 'Правилата и наградите не могат да бъдат заредени' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('table', { name: 'Правила за печелене на точки' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'weekly_leader', exact: true })).toBeVisible();
  failing = false;
  await page.getByRole('button', { name: 'Опитай отново', exact: true }).click();
  await expect(page.getByRole('table', { name: 'Правила за печелене на точки' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Рамка на читателя', exact: true })).toBeVisible();
});
