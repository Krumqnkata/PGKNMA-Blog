import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NotificationBell from '@/components/NotificationBell';
import { renderWithProviders } from '@/test/render';

const apiMocks = vi.hoisted(() => ({
  getNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  getNotifications: apiMocks.getNotifications,
  markNotificationRead: apiMocks.markNotificationRead,
  markAllNotificationsRead: apiMocks.markAllNotificationsRead,
}));

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 7, username: 'reader' },
    isAuthenticated: true,
    loading: false,
  }),
}));

describe('NotificationBell', () => {
  beforeEach(() => {
    apiMocks.getNotifications.mockResolvedValue([
      {
        id: 12,
        text: 'Нова значка',
        html_text: 'Нова значка',
        enabled: true,
        created_at: '2026-08-10T12:00:00Z',
        category: 'gamification_badge',
        action_url: '/profile?tab=progress',
        is_gamification: true,
        is_read: false,
        read_at: null,
      },
    ]);
    apiMocks.markNotificationRead.mockResolvedValue({
      id: 12,
      read_at: '2026-08-10T12:01:00Z',
    });
    apiMocks.markAllNotificationsRead.mockResolvedValue({ marked_read: 1 });
  });

  it('uses the server read endpoint and opens the notification action', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotificationBell />);

    await user.click(screen.getByRole('button', { name: 'Известия' }));
    await user.click(screen.getByRole('tab', { name: /Постижения/ }));
    const notification = await screen.findByRole('link', { name: /Нова значка/ });
    await user.click(notification);

    await waitFor(() => {
      expect(apiMocks.markNotificationRead).toHaveBeenCalled();
      expect(apiMocks.markNotificationRead.mock.calls[0][0]).toBe(12);
    });
  });
});
