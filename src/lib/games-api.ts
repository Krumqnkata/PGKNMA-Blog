import { apiRequest } from '@/lib/api_auth';
import { getApiErrorMessage } from '@/lib/api';

export type GameSlug = 'quiz' | 'word' | 'code' | 'robot' | 'memory' | 'hunt';
export type GameMode = 'daily' | 'practice' | 'replay';
export type GameStatus = 'active' | 'won' | 'lost' | 'expired';
export interface GameInfo {
  slug: GameSlug; title: string; rules: string; icon: string; points: number;
  daily_status: GameStatus | null; best_score: number | null; wins: number;
}
export interface GameCatalog {
  enabled: boolean; start_date: string | null; day: string;
  earned_today: number; daily_cap: number; games: GameInfo[];
}
export interface QuizQuestion { text: string; options: string[] }
export interface GameStates {
  quiz: { answered: number; total: number; question?: QuizQuestion; review?: (QuizQuestion & { answer: number; chosen: number; explanation: string; source: string })[] };
  word: { hint: string; letters: string[]; remaining: number; masked: string[] };
  code: { guesses: { guess: string; exact: number; misplaced: number }[]; remaining: number; solution?: string };
  robot: { start: number[]; goal: number[]; walls: number[][]; commands: string[]; direction: number; remaining: number; attempts: { order: number[]; path: number[][]; won: boolean }[] };
  memory: { cards: (string | null)[]; matched: number[]; open: number[]; turns: number; remaining: number };
  hunt: { title: string; text: string; question: string; answers: string[]; remaining: number; solution?: string };
}
interface SessionBase {
  id: string; puzzle_id: string; mode: GameMode; status: GameStatus; revision: number;
  expires_at: string; reward_eligible: boolean; points_awarded: number; score: number | null;
  earned_today: number; daily_cap: number;
}
export type GameSession = { [K in GameSlug]: SessionBase & { game: K; state: GameStates[K] } }[GameSlug];
export type GameAction = { choice: number } | { letter: string } | { guess: string } | { order: number[] } | { index: number } | { kind: 'close' } | { answer: string };
export interface StartGame { game: GameSlug; mode: GameMode; request_id: string; puzzle_id?: string }
export interface SubmitGameAction { revision: number; request_id: string; action: GameAction }

export class GameApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
async function request<T>(path: string, body?: unknown): Promise<T> {
  const response = await apiRequest(`/api/games/${path}`, body ? { method: 'POST', body: JSON.stringify(body) } : undefined);
  if (!response.ok) throw new GameApiError(await getApiErrorMessage(response, 'Играта не може да бъде заредена.'), response.status);
  return response.json();
}
export const getGames = () => request<GameCatalog>('');
export const startGame = (body: StartGame) => request<GameSession>('sessions/', body);
export const getGameSession = (id: string) => request<GameSession>(`sessions/${encodeURIComponent(id)}/`);
export const sendGameAction = (id: string, body: SubmitGameAction) => request<GameSession>(`sessions/${encodeURIComponent(id)}/actions/`, body);
