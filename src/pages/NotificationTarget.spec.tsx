import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { requiresDocumentNavigation } from '@/lib/notification-navigation';
import NotificationTarget from '@/pages/NotificationTarget';

const apiMocks = vi.hoisted(() => ({
  getNotificationTarget: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  getNotificationTarget: apiMocks.getNotificationTarget,
}));

vi.mock('@/hooks/use-seo', () => ({
  useSEO: vi.fn(),
}));

const renderTarget = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/notification/42']}>
        <Routes>
          <Route path="/notification/:id" element={<NotificationTarget />} />
          <Route path="/news" element={<div>Страницата с новини</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('NotificationTarget', () => {
  beforeEach(() => {
    apiMocks.getNotificationTarget.mockReset();
  });

  it('shows a useful fallback for deleted content', async () => {
    apiMocks.getNotificationTarget.mockResolvedValue({
      available: false,
      action_url: '',
      detail: 'Това съдържание вече не е налично.',
    });

    renderTarget();

    expect(await screen.findByRole('heading', {
      name: 'Съдържанието вече не е налично',
    })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Актуални новини/ })).toHaveAttribute('href', '/news');
  });

  it('redirects to a currently available notification action', async () => {
    apiMocks.getNotificationTarget.mockResolvedValue({
      available: true,
      action_url: '/news',
      detail: '',
    });

    renderTarget();

    expect(await screen.findByText('Страницата с новини')).toBeInTheDocument();
  });

  it('uses a full document navigation for Django admin destinations', () => {
    expect(requiresDocumentNavigation('/admin/team-chat/discussions/12/')).toBe(true);
    expect(requiresDocumentNavigation('/news')).toBe(false);
  });
});
