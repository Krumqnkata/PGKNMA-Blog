import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Check, Gamepad2, Loader2, Sparkles, Trophy } from 'lucide-react';
import { InteriorPage, InteriorPageHero, InteriorSection } from '@/components/InteriorPage';
import { Button } from '@/components/ui/button';
import GameBoard from '@/components/games/GameBoard';
import { useAuth } from '@/hooks/use-auth';
import { useSEO } from '@/hooks/use-seo';
import { GameApiError, getGames, getGameSession, sendGameAction, startGame } from '@/lib/games-api';
import type { GameAction, GameMode, GameSession, StartGame, SubmitGameAction } from '@/lib/games-api';

const statusLabels = { active: 'Започната', won: 'Решена', lost: 'Приключена', expired: 'Изтекла' };
const recordLabels = { quiz: 'верни отговора', word: 'грешки', code: 'опита', robot: 'проверки', memory: 'хода', hunt: 'опита' };
type Pending = { kind: 'start'; body: StartGame } | { kind: 'action'; id: string; body: SubmitGameAction };

function DailyPoints({ earned, cap }: { earned: number; cap: number }) {
  return <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5" aria-label="Дневни игрови точки">
    <div className="flex flex-wrap items-center justify-between gap-2"><span className="flex items-center gap-2 text-sm font-medium"><Sparkles className="size-4 text-primary" />Спечелени днес</span><strong className="text-lg tabular-nums">{earned}/{cap} точки</strong></div>
    <div role="progressbar" aria-label="Дневен лимит за точки" aria-valuemin={0} aria-valuemax={Math.max(cap, 1)} aria-valuenow={Math.min(earned, cap)} className="mt-3 h-2 overflow-hidden rounded-full bg-primary/10"><div className="h-full rounded-full bg-primary transition-all motion-reduce:transition-none" style={{ width: `${cap ? Math.min(100, earned/cap*100) : 100}%` }} /></div>
    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{earned >= cap ? 'Дневният лимит е достигнат. Можеш да продължиш за удоволствие и личен рекорд.' : 'Печелиш от нови успешно решени задачи. Лимитът е общ за шестте игри.'}</p>
  </div>;
}

export default function Games() {
  const { slug } = useParams();
  const { user } = useAuth();
  return <GamesScreen key={`${slug ?? 'catalog'}:${user?.id ?? 'guest'}`} />;
}

function GamesScreen() {
  const { slug } = useParams();
  const { user, isLoading: authLoading, openLoginDialog } = useAuth();
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const sessionId = params.get('session');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const [error, setError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const pending = useRef<Pending | null>(null);
  const catalog = useQuery({ queryKey: ['games', user?.id], queryFn: getGames, refetchInterval: 60_000 });
  const sessionQuery = useQuery({ queryKey: ['game-session', user?.id, sessionId], queryFn: () => getGameSession(sessionId!), enabled: !!user && !!sessionId && !!slug, retry: false, refetchOnWindowFocus: true });
  const game = catalog.data?.games.find(item => item.slug === slug);
  const session = sessionQuery.data?.game === slug ? sessionQuery.data : undefined;
  useSEO({ title: game?.title ?? 'Игри', description: 'Шест кратки игри, нови дневни предизвикателства и точки за твоя напредък в ПГКНМА Блог.' });

  const accept = (result: GameSession) => {
    queryClient.setQueryData(['game-session', user?.id, result.id], result);
    setParams({ session: result.id }, { replace: true });
    void queryClient.invalidateQueries({ queryKey: ['games'] });
    if (result.status === 'won') {
      void queryClient.invalidateQueries({ queryKey: ['gamification-profile'] });
      void queryClient.invalidateQueries({ queryKey: ['gamification-leaderboard'] });
    }
  };
  const perform = async (task: Pending) => {
    if (busyRef.current) return;
    busyRef.current = true;
    pending.current = task;
    setBusy(true); setError(null); setCanRetry(false);
    try {
      const result = task.kind === 'start' ? await startGame(task.body) : await sendGameAction(task.id, task.body);
      if (!mounted.current) return;
      accept(result);
      pending.current = null;
    } catch (failure) {
      if (!mounted.current) return;
      setError(failure instanceof Error ? failure.message : 'Връзката прекъсна. Опитай отново.');
      // A network retry must reuse the original request identifier and body.
      setCanRetry(!(failure instanceof GameApiError) || failure.status >= 500 || failure.status === 429);
      if (failure instanceof GameApiError && failure.status === 409) await sessionQuery.refetch();
    } finally { setBusy(false); busyRef.current = false; }
  };
  const start = (mode: GameMode) => {
    if (!user) { openLoginDialog(); return; }
    if (!game) return;
    void perform({ kind: 'start', body: { game: game.slug, mode, request_id: crypto.randomUUID(), ...(mode === 'replay' && session ? { puzzle_id: session.puzzle_id } : {}) } });
  };
  const action = (value: GameAction) => {
    if (session) void perform({ kind: 'action', id: session.id, body: { action: value, revision: session.revision, request_id: crypto.randomUUID() } });
  };

  return <InteriorPage>
    <InteriorPageHero eyebrow="Малка пауза. Ново предизвикателство." icon={Gamepad2} title={game ? game.title : <>Време е за <span className="text-primary">игра.</span></>} description={game?.rules ?? 'Открий думата, разгадай кода или заведи робота до целта. Шест начина да раздвижиш ума си и да напреднеш в блога.'} actions={slug ? <Button asChild variant="outline"><Link to="/games"><ArrowLeft className="mr-2 size-4" />Всички игри</Link></Button> : <Button asChild variant="outline"><Link to="/gamification"><Trophy className="mr-2 size-4" />Мисии и награди</Link></Button>} />
    <InteriorSection containerClassName={slug ? 'max-w-3xl' : 'max-w-6xl'}>
      {catalog.isPending && <p className="flex items-center gap-2" role="status"><Loader2 className="size-5 animate-spin motion-reduce:animate-none" />Зареждане на игрите…</p>}
      {catalog.isError && <div role="alert" className="space-y-3 rounded-2xl border p-6"><p>Игрите не могат да бъдат заредени.</p><Button variant="outline" onClick={() => void catalog.refetch()}>Опитай отново</Button></div>}
      {catalog.data && <div className="space-y-8">
        <DailyPoints earned={catalog.data.earned_today} cap={catalog.data.daily_cap} />
        {!catalog.data.enabled && <p role="status" className="rounded-2xl border bg-muted/40 p-5">Игрите все още не са отворени{catalog.data.start_date ? ` или са временно спрени. Начална дата: ${catalog.data.start_date}` : '.'} Можеш да разгледаш правилата по-долу.</p>}
        {!slug && <>
          <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold">Избери своето предизвикателство</h2><p className="mt-2 text-sm text-muted-foreground">Нови дневни задачи в полунощ, българско време.</p></div><span className="rounded-full border px-3 py-1 text-xs font-medium">6 игри · Без бързане</span></div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{catalog.data.games.map((item, index) => <Link key={item.slug} to={`/games/${item.slug}`} className="group relative flex flex-col rounded-3xl border bg-card p-6 shadow-sm transition-colors hover:border-primary/50 hover:bg-primary/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none">
            <div className="mb-7 flex items-start justify-between"><span className="flex size-16 items-center justify-center rounded-2xl border bg-primary/5 text-3xl" aria-hidden="true">{item.icon}</span><span className="font-mono text-xs text-muted-foreground">0{index+1}</span></div>
            <h3 className="text-xl font-bold">{item.title}</h3><p className="mb-6 mt-2 flex-1 text-sm leading-6 text-muted-foreground">{item.rules}</p>
            <div className="flex items-center justify-between border-t pt-4"><span className="text-sm font-medium text-primary">{item.daily_status ? <><Check className="mr-1 inline size-4" />{statusLabels[item.daily_status]}</> : `До +${item.points} точки`}</span><ArrowUpRight className="size-5 text-muted-foreground group-hover:text-primary" /></div>
            {user && item.best_score !== null && <p className="mt-3 text-xs text-muted-foreground">Личен рекорд: {item.best_score} {recordLabels[item.slug]} · {item.wins} победи</p>}
          </Link>)}</div>
          <div className="rounded-2xl border bg-muted/30 p-6 text-sm leading-7 text-muted-foreground"><h2 className="mb-2 font-bold text-foreground">Как печелиш точки</h2><p>Дневното предизвикателство е еднакво за всички. Допълнителните игри също носят точки, докато стигнеш общия дневен лимит. Вече играна задача е упражнение и не носи нова награда. Играеш със своя профил, за да запазим напредъка ти.</p></div>
        </>}
        {slug && !game && <p role="alert">Тази игра не съществува. Избери игра от каталога.</p>}
        {game && <>
          <div className="flex flex-wrap gap-3"><Button disabled={busy || authLoading || !catalog.data.enabled} onClick={() => start('daily')}>{game.daily_status ? 'Отвори дневната игра' : 'Дневно предизвикателство'}</Button><Button variant="outline" disabled={busy || authLoading || !catalog.data.enabled} onClick={() => start('practice')}>Допълнителна игра</Button></div>
          {!user && <div className="rounded-2xl border p-6"><h2 className="text-lg font-bold">Твоят напредък започва с профил</h2><p className="mt-2 text-sm text-muted-foreground">Влез, за да играеш, да събираш точки и да продължиш от друго устройство.</p><Button className="mt-4" disabled={authLoading} onClick={openLoginDialog}>Влез и играй</Button></div>}
          {error && <div role="alert" className="space-y-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4"><p>{error}</p>{canRetry && pending.current && <Button variant="outline" disabled={busy} onClick={() => pending.current && void perform(pending.current)}>Повтори действието</Button>}</div>}
          {user && sessionId && sessionQuery.isPending && <p role="status">Възстановяване на играта…</p>}
          {user && sessionQuery.isError && <div role="alert" className="space-y-3 rounded-xl border p-4"><p>Тази сесия не може да бъде заредена. Може да принадлежи на друг профил.</p><Button variant="outline" onClick={() => void sessionQuery.refetch()}>Зареди отново</Button></div>}
          {session && user && <section aria-label="Игрово поле" className="space-y-6 rounded-3xl border bg-card p-4 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4"><span className="text-xs font-bold uppercase tracking-widest text-primary">{session.mode === 'daily' ? 'Дневно предизвикателство' : session.reward_eligible ? 'Допълнителна игра' : 'Упражнение'}</span><span className="text-xs text-muted-foreground">До {new Date(session.expires_at).toLocaleString('bg-BG', { timeZone: 'Europe/Sofia', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div>
            {!session.reward_eligible && <p className="text-sm text-muted-foreground">Тази задача вече е играна. Упражнението не носи допълнителни точки.</p>}
            {session.status !== 'active' && <div role="status" className="rounded-2xl bg-primary/10 p-5"><h2 className="text-xl font-bold">{session.status === 'won' ? 'Браво, реши задачата!' : session.status === 'expired' ? 'Времето на тази сесия изтече' : 'Този опит приключи'}</h2><p className="mt-2 text-sm">{session.points_awarded > 0 ? `Получаваш +${session.points_awarded} точки за своя напредък.` : session.status === 'won' ? 'Победата е запазена. Този път няма допълнителни точки.' : 'Следващото предизвикателство те очаква.'}</p></div>}
            {session.status !== 'expired' && <GameBoard key={session.id} session={session} busy={busy || !catalog.data.enabled} onAction={action} />}
            {busy && <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin motion-reduce:animate-none" />Запазване…</p>}
            {session.status !== 'active' && <div className="flex flex-wrap gap-3 border-t pt-5"><Button disabled={busy || !catalog.data.enabled} onClick={() => start('practice')}>Следваща игра</Button>{session.status !== 'expired' && <Button variant="outline" disabled={busy || !catalog.data.enabled} onClick={() => start('replay')}>Упражни същата задача</Button>}</div>}
          </section>}
        </>}
      </div>}
    </InteriorSection>
  </InteriorPage>;
}
