import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AIAssistant, { ANONYMOUS_CHAT_KEY } from '@/components/AIAssistant';
import { renderWithProviders } from '@/test/render';

const mocks = vi.hoisted(() => {
  class MockApiResponseError extends Error {
    code?: string;
    status: number;

    constructor(message: string, status: number, code?: string) {
      super(message);
      this.status = status;
      this.code = code;
    }
  }
  return {
    askAssistant: vi.fn(),
    getAssistantConversations: vi.fn(),
    getAssistantConversation: vi.fn(),
    deleteAssistantConversation: vi.fn(),
    auth: { isAuthenticated: true },
    ApiResponseError: MockApiResponseError,
  };
});

vi.mock('@/lib/api', () => ({
  askAssistant: mocks.askAssistant,
  getAssistantConversations: mocks.getAssistantConversations,
  getAssistantConversation: mocks.getAssistantConversation,
  deleteAssistantConversation: mocks.deleteAssistantConversation,
  ApiResponseError: mocks.ApiResponseError,
}));

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: mocks.auth.isAuthenticated ? { id: 3, username: 'мария' } : null,
    isAuthenticated: mocks.auth.isAuthenticated,
    loading: false,
  }),
}));

vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({ onSuccess }: { onSuccess: (token: string) => void }) => (
    <button type="button" onClick={() => onSuccess('turnstile-token')}>
      Не съм робот
    </button>
  ),
}));

const openAssistant = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Отвори ИИ асистента' }));
  return screen.getByLabelText('Вашият въпрос');
};

describe('AIAssistant', () => {
  beforeEach(() => {
    mocks.auth.isAuthenticated = true;
    mocks.askAssistant.mockReset();
    mocks.getAssistantConversations.mockReset().mockResolvedValue([]);
    mocks.getAssistantConversation.mockReset();
    mocks.deleteAssistantConversation.mockReset().mockResolvedValue(undefined);
    localStorage.clear();
  });

  it('pops out a "Питай ме!" bubble once per session that opens the chat', async () => {
    sessionStorage.clear();
    vi.useFakeTimers();
    try {
      const { unmount } = renderWithProviders(<AIAssistant />);
      expect(screen.queryByText(/Питайте ме!/)).not.toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(4000);
      });
      const bubble = screen.getByText(/Питайте ме!/);
      fireEvent.click(bubble);
      expect(screen.getByLabelText('Вашият въпрос')).toBeInTheDocument();
      expect(screen.queryByText(/Питайте ме!/)).not.toBeInTheDocument();
      unmount();

      // Already shown in this session: it does not come back.
      renderWithProviders(<AIAssistant />);
      await act(async () => {
        vi.advanceTimersByTime(10000);
      });
      expect(screen.queryByText(/Питайте ме!/)).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
      sessionStorage.clear();
    }
  });

  it('greets the visitor by name when the chat opens', async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithProviders(<AIAssistant />);
    await openAssistant(user);
    expect(screen.getByText('Здравейте, мария! 👋')).toBeInTheDocument();
    unmount();

    mocks.auth.isAuthenticated = false;
    renderWithProviders(<AIAssistant />);
    await openAssistant(user);
    expect(screen.getByText('Здравейте! 👋')).toBeInTheDocument();
    expect(mocks.askAssistant).not.toHaveBeenCalled();
  });

  it('sends a question and shows the answer, its sources and where it came from', async () => {
    mocks.askAssistant.mockResolvedValue({
      answer: 'Ваканцията започва на 22 декември.',
      sources: [{ title: 'Коледна ваканция', url: '/post/5' }, { title: 'Прием', url: 'https://pgknma.com/priem' }],
      answer_source: 'rule',
      conversation_id: 9,
    });
    const user = userEvent.setup();
    renderWithProviders(<AIAssistant />);

    const input = await openAssistant(user);
    await user.type(input, 'Кога е ваканцията?{Enter}');

    expect(await screen.findByText('Ваканцията започва на 22 декември.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Коледна ваканция' })).toHaveAttribute('href', '/post/5');
    expect(screen.getByRole('link', { name: 'Прием ↗' })).toHaveAttribute('target', '_blank');
    expect(screen.getByText('⚡ Отговор от сайта')).toBeInTheDocument();
    // Logged-in users continue the conversation on the server; no history is sent.
    expect(mocks.askAssistant).toHaveBeenCalledWith({ question: 'Кога е ваканцията?' });

    mocks.askAssistant.mockResolvedValue({ answer: 'Втори.', sources: [], answer_source: 'ai', conversation_id: 9 });
    await user.type(input, 'А после?{Enter}');
    expect(await screen.findByText('🤖 ИИ — може да греши')).toBeInTheDocument();
    expect(mocks.askAssistant).toHaveBeenLastCalledWith({ question: 'А после?', conversation_id: 9 });
  });

  it('continues the latest saved conversation and can start a new one', async () => {
    mocks.getAssistantConversations.mockResolvedValue([{ id: 4, title: 'Програма', updated_at: '2026-11-14T10:00:00Z' }]);
    mocks.getAssistantConversation.mockResolvedValue({
      id: 4,
      title: 'Програма',
      updated_at: '2026-11-14T10:00:00Z',
      messages: [
        { id: 1, role: 'user', content: 'програма 11б', answer_source: '', sources: [], created_at: '2026-11-14T10:00:00Z' },
        { id: 2, role: 'assistant', content: 'Програма на 11Б за сряда…', answer_source: 'rule', sources: [], created_at: '2026-11-14T10:00:01Z' },
      ],
    });
    const user = userEvent.setup();
    renderWithProviders(<AIAssistant />);
    await openAssistant(user);

    expect(await screen.findByText('Програма на 11Б за сряда…')).toBeInTheDocument();
    expect(mocks.getAssistantConversation).toHaveBeenCalledWith(4);

    await user.click(screen.getByRole('button', { name: /Нов разговор/ }));
    expect(screen.queryByText('Програма на 11Б за сряда…')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /История/ }));
    await user.click(await screen.findByRole('button', { name: 'Изтрий разговора „Програма“' }));
    expect(mocks.deleteAssistantConversation).toHaveBeenCalledWith(4);
  });

  it('keeps an anonymous conversation in this browser', async () => {
    mocks.auth.isAuthenticated = false;
    mocks.askAssistant
      .mockResolvedValueOnce({ answer: 'Първи отговор.', sources: [], answer_source: 'rule', ai_session: 'session-1' })
      .mockResolvedValueOnce({ answer: 'Втори отговор.', sources: [], answer_source: 'ai' });
    const user = userEvent.setup();
    const { unmount } = renderWithProviders(<AIAssistant />);

    const input = await openAssistant(user);
    await user.type(input, 'Първи въпрос');
    const send = screen.getByRole('button', { name: 'Изпрати въпроса' });
    expect(send).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Не съм робот' }));
    await user.click(send);
    expect(await screen.findByText('Първи отговор.')).toBeInTheDocument();
    expect(mocks.askAssistant).toHaveBeenLastCalledWith(
      expect.objectContaining({ question: 'Първи въпрос', turnstile_token: 'turnstile-token' }),
    );

    await user.type(input, 'Втори въпрос{Enter}');
    expect(await screen.findByText('Втори отговор.')).toBeInTheDocument();
    const lastCall = mocks.askAssistant.mock.calls[1][0];
    expect(lastCall).toMatchObject({ question: 'Втори въпрос', ai_session: 'session-1' });
    expect(lastCall).not.toHaveProperty('turnstile_token');
    expect(lastCall.history).toEqual([
      { role: 'user', content: 'Първи въпрос' },
      { role: 'assistant', content: 'Първи отговор.' },
    ]);
    expect(mocks.getAssistantConversations).not.toHaveBeenCalled();

    unmount();
    expect(JSON.parse(localStorage.getItem(ANONYMOUS_CHAT_KEY) || '[]')).toHaveLength(4);
    renderWithProviders(<AIAssistant />);
    await openAssistant(user);
    expect(screen.getByText('Втори отговор.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Нов разговор/ }));
    await waitFor(() => expect(localStorage.getItem(ANONYMOUS_CHAT_KEY)).toBeNull());
  });

  it('shows the server message when the assistant is not available', async () => {
    mocks.askAssistant.mockRejectedValue(
      new mocks.ApiResponseError('Асистентът почива до утре.', 503, 'ai_daily_limit'),
    );
    const user = userEvent.setup();
    renderWithProviders(<AIAssistant />);

    const input = await openAssistant(user);
    await user.type(input, 'Въпрос{Enter}');

    await waitFor(() => expect(screen.getByText('Асистентът почива до утре.')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Изпрати въпроса' })).toBeDisabled();
  });
});
