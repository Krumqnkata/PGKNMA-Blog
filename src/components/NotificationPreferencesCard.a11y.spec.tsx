import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { expect, it, vi } from 'vitest';

import NotificationPreferencesCard from '@/components/NotificationPreferencesCard';
import { renderWithProviders } from '@/test/render';

vi.mock('@/lib/api', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/api')>(),
  getNotificationPreferences: vi.fn().mockResolvedValue({
    general_enabled: true,
    points_enabled: true,
    levels_enabled: true,
    badges_enabled: true,
    missions_enabled: true,
    rewards_enabled: true,
    posts_enabled: true,
    events_enabled: true,
    polls_enabled: true,
    comment_replies_enabled: true,
    submissions_enabled: true,
    mission_available_enabled: true,
    security_enabled: true,
    updated_at: '2026-08-10T12:00:00Z',
  }),
  updateNotificationPreferences: vi.fn(),
}));

it('has no automatically detectable accessibility violations', async () => {
  const { container } = renderWithProviders(<NotificationPreferencesCard />);
  await screen.findByRole('switch', { name: 'Официални известия' });

  const results = await axe(container, {
    rules: {
      // jsdom has no layout/canvas engine; contrast is covered in browser QA.
      'color-contrast': { enabled: false },
    },
  });
  expect(results.violations).toEqual([]);
});
