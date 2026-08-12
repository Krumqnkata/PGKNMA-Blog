import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NotificationBell from '@/components/NotificationBell';
import { renderWithProviders } from '@/test/render';

const apiMocks = vi.hoisted(() => ({
  getNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  archiveNotification: vi.fn(),
  archiveReadNotifications: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  getNotifications: apiMocks.getNotifications,
  markNotificationRead: apiMocks.markNotificationRead,
  markAllNotificationsRead: apiMocks.markAllNotificationsRead,
  archiveNotification: apiMocks.archiveNotification,
  archiveReadNotifications: apiMocks.archiveReadNotifications,
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
        is_archived: false,
        archived_at: null,
      },
    ]);
    apiMocks.markNotificationRead.mockResolvedValue({
      id: 12,
      read_at: '2026-08-10T12:01:00Z',
    });
    apiMocks.markAllNotificationsRead.mockResolvedValue({ marked_read: 1 });
    apiMocks.archiveNotification.mockResolvedValue({
      id: 12,
      is_archived: true,
      archived_at: '2026-08-10T12:02:00Z',
    });
    apiMocks.archiveReadNotifications.mockResolvedValue({ archived: 1 });
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

  it('archives a notification from the bell', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotificationBell />);

    await user.click(screen.getByRole('button', { name: 'Известия' }));
    await user.click(screen.getByRole('tab', { name: /Постижения/ }));
    await user.click(await screen.findByRole('button', { name: 'Архивирай известието' }));

    await waitFor(() => {
      expect(apiMocks.archiveNotification).toHaveBeenCalled();
      expect(apiMocks.archiveNotification.mock.calls[0][0]).toBe(12);
    });
  });
});
