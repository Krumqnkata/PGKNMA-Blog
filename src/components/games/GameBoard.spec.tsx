import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GameBoard from '@/components/games/GameBoard';
import type { GameSession } from '@/lib/games-api';

const base = { id: 's', puzzle_id: 'p', mode: 'daily' as const, status: 'active' as const, revision: 0, expires_at: '2026-10-06T00:00:00+03:00', reward_eligible: true, points_awarded: 0, score: null, earned_today: 0, daily_cap: 30 };

describe('game controls', () => {
  it('submits the selected answer index and locks buttons while saving', () => {
    const onAction = vi.fn();
    const session: GameSession = { ...base, game: 'quiz', state: { answered: 0, total: 5, question: { text: 'Коя е столицата на България?', options: ['София','Пловдив','Варна','Бургас'] } } };
    const { rerender } = render(<GameBoard session={session} busy={false} onAction={onAction} />);
    fireEvent.click(screen.getByRole('button', { name: /София/ }));
    expect(onAction).toHaveBeenCalledWith({ choice: 0 });
    rerender(<GameBoard session={session} busy onAction={onAction} />);
    expect(screen.getByRole('button', { name: /София/ })).toBeDisabled();
  });

  it('disables already guessed letters and displays server-provided mask', () => {
    const session: GameSession = { ...base, game: 'word', state: { hint: 'Технология', letters: ['К'], masked: ['К','_','_'], remaining: 6 } };
    render(<GameBoard session={session} busy={false} onAction={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Буква К' })).toBeDisabled();
    expect(screen.getByLabelText('Дума: К _ _')).toBeVisible();
  });

  it('preserves the leading zero in a code', () => {
    const onAction = vi.fn();
    render(<GameBoard session={{ ...base, game: 'code', state: { guesses: [], remaining: 8 } }} busy={false} onAction={onAction} />);
    fireEvent.change(screen.getByLabelText('Твоята комбинация'), { target: { value: '0123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Провери отговора' }));
    expect(onAction).toHaveBeenCalledWith({ guess: '0123' });
  });

  it('only displays revealed cards and closes a mismatch explicitly', () => {
    const onAction = vi.fn();
    render(<GameBoard session={{ ...base, game: 'memory', state: { cards: ['🍎','🍋', ...Array(14).fill(null)], matched: [], open: [0,1], turns: 1, remaining: 19 } }} busy={false} onAction={onAction} />);
    expect(screen.getByRole('button', { name: 'Карта 3: затворена' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Запомних — затвори двойката' }));
    expect(onAction).toHaveBeenCalledWith({ kind: 'close' });
  });

  it('supports reordering robot commands entirely with buttons', () => {
    const onAction = vi.fn();
    render(<GameBoard session={{ ...base, game: 'robot', state: { start: [0,0], goal: [1,0], direction: 0, walls: [], commands: ['forward','right'], attempts: [], remaining: 5 } }} busy={false} onAction={onAction} />);
    fireEvent.click(screen.getByRole('button', { name: 'Команда 2 нагоре' }));
    fireEvent.click(screen.getByRole('button', { name: 'Провери маршрута' }));
    expect(onAction).toHaveBeenCalledWith({ order: [1,0] });
  });

  it('shows the reading text without rendering HTML and submits a short answer', () => {
    const onAction = vi.fn();
    render(<GameBoard session={{ ...base, game: 'hunt', state: { title: 'Опит', text: '<script>test</script> Екипът използва сензор.', question: 'Какъв е инструментът?', answers: [], remaining: 3 } }} busy={false} onAction={onAction} />);
    expect(screen.getByText(/<script>test/)).toBeVisible();
    fireEvent.change(screen.getByLabelText('Твоят отговор'), { target: { value: 'сензор' } });
    fireEvent.click(screen.getByRole('button', { name: 'Провери отговора' }));
    expect(onAction).toHaveBeenCalledWith({ answer: 'сензор' });
  });

  it('prevents further moves once a round has ended', () => {
    render(<GameBoard session={{ ...base, game: 'word', status: 'lost', state: { hint: 'Дума', letters: [], masked: ['К','О','Д'], remaining: 0 } }} busy={false} onAction={vi.fn()} />);
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
  });
});
