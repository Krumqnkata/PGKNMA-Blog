import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import MemeOfTheWeek from '@/pages/MemeOfTheWeek';
import { renderWithProviders } from '@/test/render';
import type { Meme } from '@/lib/api';

const meme = (overrides: Partial<Meme>): Meme => ({
  id: 1,
  title: 'Меме',
  image_url: '/api/memes/1/image/',
  user_username: 'автор',
  created_at: '2026-11-10T09:00:00Z',
  status: 'approved',
  votes: 0,
  has_voted: false,
  week_start: '2026-11-09',
  is_current_week: true,
  ...overrides,
});

const api = vi.hoisted(() => ({
  getMemes: vi.fn(),
  getMemeWeeks: vi.fn(),
  getMemeWinner: vi.fn(),
  submitMeme: vi.fn(),
  voteForMeme: vi.fn(),
}));

vi.mock('@/lib/api', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/api')>(),
  ...api,
}));

vi.mock('@/hooks/use-auth', () => ({ useAuth: () => ({ isAuthenticated: true, user: { id: 1, username: 'гласуващ' } }) }));
vi.mock('@/hooks/use-go-to-login', () => ({ useGoToLogin: () => vi.fn() }));

describe('Меме на седмицата', () => {
  beforeEach(() => {
    const lastWeekWinner = meme({ id: 7, title: 'Победителят', votes: 12, week_start: '2026-11-02', is_current_week: false });
    api.getMemes.mockImplementation(async (week?: string) => (
      week === '2026-11-02'
        ? [lastWeekWinner, meme({ id: 8, title: 'Второ място', votes: 3, week_start: '2026-11-02', is_current_week: false })]
        : [meme({ id: 1, title: 'Текущо меме', votes: 2 })]
    ));
    api.getMemeWinner.mockResolvedValue({ week_start: '2026-11-02', winner_votes: 12, winner: lastWeekWinner });
    api.getMemeWeeks.mockResolvedValue({
      current_week_start: '2026-11-09',
      voting_ends_at: '2099-11-15T23:59:59+02:00',
      results: [{ week_start: '2026-11-02', meme_count: 2, winner: lastWeekWinner, winner_votes: 12 }],
      has_more: false,
    });
  });

  it('shows last week\'s winner and lets people vote only this week', async () => {
    renderWithProviders(<MemeOfTheWeek />);

    const banner = await screen.findByRole('region', { name: 'Победителят' });
    expect(within(banner).getByText('Меме на миналата седмица')).toBeInTheDocument();
    expect(within(banner).getByText('2 – 8 ноември 2026')).toBeInTheDocument();

    expect(await screen.findByText('Текущо меме')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Гласувай' })).toBeEnabled();
    expect(screen.getByText(/Гласуването приключва в неделя в 23:59/)).toBeInTheDocument();
  });

  it('opens a past week from the archive without vote buttons', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MemeOfTheWeek />);

    const weekButton = await screen.findByRole('button', { name: /2 – 8 ноември 2026/ });
    expect(weekButton).toHaveAttribute('aria-expanded', 'false');
    await user.click(weekButton);

    expect(await screen.findByText('Второ място')).toBeInTheDocument();
    expect(api.getMemes).toHaveBeenCalledWith('2026-11-02');
    const archiveItem = weekButton.closest('div.rounded-lg, [class*="overflow-hidden"]') as HTMLElement;
    expect(within(archiveItem).getByText('Победител')).toBeInTheDocument();
    expect(within(archiveItem).queryByRole('button', { name: /Гласувай|Гласувано/ })).not.toBeInTheDocument();
  });
});
