import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ArchivedNotifications from '@/components/ArchivedNotifications';
import type { Notification } from '@/lib/api';
import { renderWithProviders } from '@/test/render';

const apiMocks = vi.hoisted(() => ({
  getNotifications: vi.fn(),
  restoreNotification: vi.fn(),
}));

vi.mock('@/lib/api', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/api')>(),
  getNotifications: apiMocks.getNotifications,
  restoreNotification: apiMocks.restoreNotification,
}));

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 7, username: 'reader' },
    isAuthenticated: true,
    loading: false,
  }),
}));

const archivedNotifications: Notification[] = [
  {
    id: 21,
    text: 'Ръчно скрито известие',
    html_text: 'Ръчно скрито известие',
    enabled: true,
    created_at: '2026-08-01T09:00:00Z',
    category: 'general',
    action_url: '',
    is_gamification: false,
    is_read: true,
    read_at: '2026-08-02T09:00:00Z',
    important: false,
    expires_at: '2026-08-31T09:00:00Z',
    is_archived: true,
    archived_at: '2026-08-02T09:00:00Z',
    is_auto_archived: false,
    can_restore: true,
  },
  {
    id: 22,
    text: 'Изтекла актуализация',
    html_text: 'Изтекла актуализация',
    enabled: true,
    created_at: '2026-08-01T10:00:00Z',
    category: 'content_post',
    action_url: '/post/22',
    is_gamification: false,
    is_read: false,
    read_at: null,
    important: false,
    expires_at: '2026-08-08T10:00:00Z',
    is_archived: true,
    archived_at: '2026-08-08T10:00:00Z',
    is_auto_archived: true,
    can_restore: false,
  },
];

describe('ArchivedNotifications', () => {
  beforeEach(() => {
    apiMocks.getNotifications.mockResolvedValue(archivedNotifications);
    apiMocks.restoreNotification.mockResolvedValue({
      id: 21,
      is_archived: false,
      archived_at: null,
    });
  });

  it('labels automatic expiry and restores only manually archived rows', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ArchivedNotifications />);

    expect(await screen.findByText('Изтекла актуализация')).toBeInTheDocument();
    expect(screen.getByText(/Автоматично архивирано/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Възстанови/ })).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: /Възстанови/ }));

    await waitFor(() => {
      expect(apiMocks.restoreNotification).toHaveBeenCalled();
      expect(apiMocks.restoreNotification.mock.calls[0][0]).toBe(21);
    });
  });
});
