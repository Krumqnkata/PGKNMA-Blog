import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NotificationPreferencesCard from '@/components/NotificationPreferencesCard';
import { renderWithProviders } from '@/test/render';
import type { NotificationPreferences } from '@/lib/api';

const apiMocks = vi.hoisted(() => ({
  getNotificationPreferences: vi.fn(),
  updateNotificationPreferences: vi.fn(),
}));

vi.mock('@/lib/api', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/api')>(),
  getNotificationPreferences: apiMocks.getNotificationPreferences,
  updateNotificationPreferences: apiMocks.updateNotificationPreferences,
}));

const preferences: NotificationPreferences = {
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
};

describe('NotificationPreferencesCard', () => {
  beforeEach(() => {
    apiMocks.getNotificationPreferences.mockResolvedValue(preferences);
    apiMocks.updateNotificationPreferences.mockImplementation(async (patch) => ({
      ...preferences,
      ...patch,
    }));
  });

  it('loads the profile preferences and saves a changed category', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotificationPreferencesCard />);

    const badgesSwitch = await screen.findByRole('switch', { name: 'Получени значки' });
    expect(badgesSwitch).toBeChecked();

    await user.click(badgesSwitch);

    await waitFor(() => {
      expect(apiMocks.updateNotificationPreferences).toHaveBeenCalledWith({ badges_enabled: false });
    });
    expect(badgesSwitch).not.toBeChecked();
  });
});
