import { expect, test } from '@playwright/test';

const user = { id: 17, username: 'school_reader', email: 'reader@example.test', has_password: true, site_role: null, avatar_url: null, equipped_rewards: [] };
const progress = {
  points: 125,
  level: { number: 2, title: 'Активен участник', icon: 'star', minimum_points: 100 },
  next_level: { number: 3, title: 'Вдъхновител', icon: 'star', minimum_points: 200 },
  progress_percent: 25, points_to_next: 75, leaderboard_opt_in: false,
  badges: [{ slug: 'first', title: 'Първа стъпка', earned: true }],
  recent_transactions: [{ id: 1, description: 'Участие в училищна анкета', points: 25, created_at: '2026-09-20T10:00:00Z' }],
  missions: [], rewards: [],
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((account) => {
    localStorage.setItem('accessToken', 'profile-test-token');
    localStorage.setItem('user', JSON.stringify(account));
  }, user);
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/api/site-status/')) {
      return route.fulfill({ json: { maintenance_mode: false, enable_bell_suggestions: true, enable_weekly_poll: true, enable_meme_of_the_week: true, enable_program_page: true } });
    }
    if (path.endsWith('/api/profile/')) {
      return route.fulfill({ json: {
        user,
        avatar_options: { presets: [], max_upload_bytes: 5242880, output_size: 512, allowed_mime_types: ['image/png'] },
        public_profile: { bio: '', public_profile_enabled: true, show_email_on_profile: false, show_comments_on_profile: true },
      } });
    }
    if (path.endsWith('/api/gamification/profile/')) return route.fulfill({ json: progress });
    if (path.endsWith('/api/notifications/preferences/')) return route.fulfill({ json: {} });
    if (path.endsWith('/api/privacy-policy/')) return route.fulfill({ json: { date: '2026-09-23', content: 'Политика' } });
    if (path.endsWith('/api/push/config/')) return route.fulfill({ json: { enabled: false } });
    return route.fulfill({ json: [] });
  });
});

test('profile overview, settings and browser history work on desktop and phone', async ({ page }, testInfo) => {
  const width = testInfo.project.name === 'chromium' ? 1440 : 320;
  await page.setViewportSize({ width, height: 960 });
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Само необходими' }).click();
  await expect(page.getByRole('heading', { name: 'Общ преглед', exact: true })).toBeVisible();
  await expect(page.getByText('125', { exact: true })).toBeVisible();
  await expect(page.getByText('Участие в училищна анкета', { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('profile-overview.png'), fullPage: true });

  const navigation = page.getByRole('navigation', { name: 'Раздели на профила' });
  await navigation.getByRole('link', { name: 'Настройки', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Профил', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: 'Предпочитания', exact: true }).click();
  await expect(page).toHaveURL(/tab=settings&section=preferences/);
  await page.getByRole('tab', { name: 'Вход и сигурност', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Смяна на парола', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('tab', { name: 'Вход и сигурност', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.goBack();
  await expect(page.getByRole('tab', { name: 'Предпочитания', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.screenshot({ path: testInfo.outputPath('profile-preferences.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await navigation.getByRole('link', { name: 'Моите песни', exact: true }).click();
  await expect(page).toHaveURL(/tab=songs/);
  await expect(page.getByRole('heading', { name: 'Нямате предложения' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('tab', { name: 'Предпочитания', exact: true })).toHaveAttribute('aria-selected', 'true');
});

test('unknown profile sections fall back to overview and failed progress can be retried', async ({ page }) => {
  let failProgress = true;
  await page.route('**/api/gamification/profile/', (route) => failProgress
    ? route.fulfill({ status: 503, json: { detail: 'Временна грешка' } })
    : route.fulfill({ json: { ...progress, points: 0, recent_transactions: [] } }));
  await page.goto('/profile?tab=unknown');
  await page.getByRole('button', { name: 'Само необходими' }).click();
  await expect(page.getByRole('heading', { name: 'Общ преглед', exact: true })).toBeVisible();
  await expect(page.getByText('В момента прогресът и последната активност не могат да се заредят.')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('125', { exact: true })).toHaveCount(0);
  failProgress = false;
  await page.getByRole('button', { name: 'Опитай отново', exact: true }).click();
  await expect(page.getByText(/Все още няма активност с точки/)).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Раздели на профила' }).getByRole('link', { name: 'Общ преглед' })).toHaveAttribute('aria-current', 'page');
});
