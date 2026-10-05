import { useState } from 'react';
import { ArrowDown, ArrowUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { GameAction, GameSession, GameStates } from '@/lib/games-api';

interface Props { session: GameSession; busy: boolean; onAction: (action: GameAction) => void }
const commandLabels: Record<string, string> = { forward: '↑ Напред', left: '↶ Наляво', right: '↷ Надясно' };

function RobotBoard({ state, disabled, onAction }: { state: GameStates['robot']; disabled: boolean; onAction: Props['onAction'] }) {
  const [order, setOrder] = useState(() => state.commands.map((_, i) => i));
  const last = state.attempts[state.attempts.length - 1];
  const shift = (index: number, delta: number) => setOrder(old => {
    const next = [...old];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    return next;
  });
  return <div className="space-y-6">
    <p className="text-sm text-muted-foreground">Роботът започва с посока {['север ↑', 'изток →', 'юг ↓', 'запад ←'][state.direction]}. Остават {state.remaining} проверки.</p>
    <div className="mx-auto grid max-w-sm grid-cols-6 gap-1 rounded-2xl border bg-muted/40 p-3" role="img" aria-label={`Поле 6 на 6. Начало: ред ${state.start[1]+1}, колона ${state.start[0]+1}. Цел: ред ${state.goal[1]+1}, колона ${state.goal[0]+1}. Препятствия: ${state.walls.map(([x,y]) => `${y+1}/${x+1}`).join(', ')}.`}>
      {Array.from({ length: 36 }, (_, index) => {
        const x = index % 6, y = Math.floor(index / 6);
        const matches = (p: number[]) => p[0] === x && p[1] === y;
        const wall = state.walls.some(matches), start = matches(state.start), goal = matches(state.goal);
        return <div key={index} aria-hidden="true" className={`flex aspect-square items-center justify-center rounded-md text-xl sm:text-2xl ${wall ? 'bg-foreground/70' : last?.path.some(matches) ? 'bg-primary/20' : 'bg-background'}`}>{start ? '🤖' : goal ? '⭐' : wall ? '' : <span className="text-[10px] text-muted-foreground">{y+1},{x+1}</span>}</div>;
      })}
    </div>
    {last && !last.won && <p role="status" className="rounded-xl bg-muted p-3 text-sm">Тази подредба не достига целта безопасно. Промени командите и опитай отново.</p>}
    <ol className="grid gap-2 sm:grid-cols-2" aria-label="Ред на командите">
      {order.map((command, index) => <li key={command} className="flex items-center gap-2 rounded-xl border bg-background p-2">
        <span className="w-6 text-center text-xs text-muted-foreground">{index+1}</span><span className="flex-1 text-sm font-medium">{commandLabels[state.commands[command]]}</span>
        <Button variant="ghost" size="icon" disabled={disabled || index === 0} aria-label={`Команда ${index+1} нагоре`} onClick={() => shift(index, -1)}><ArrowUp className="size-4" /></Button>
        <Button variant="ghost" size="icon" disabled={disabled || index === order.length-1} aria-label={`Команда ${index+1} надолу`} onClick={() => shift(index, 1)}><ArrowDown className="size-4" /></Button>
      </li>)}
    </ol>
    <div className="flex flex-wrap gap-3"><Button disabled={disabled} onClick={() => onAction({ order })}>Провери маршрута</Button><Button variant="outline" disabled={disabled} onClick={() => setOrder(state.commands.map((_,i) => i))}><RotateCcw className="mr-2 size-4" />Начална подредба</Button></div>
  </div>;
}

function TextAnswer({ kind, disabled, onAction }: { kind: 'code' | 'hunt'; disabled: boolean; onAction: Props['onAction'] }) {
  const [value, setValue] = useState('');
  return <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={event => {
    event.preventDefault();
    onAction(kind === 'code' ? { guess: value } : { answer: value });
  }}>
    <div className="flex-1 space-y-2"><Label htmlFor="game-answer">{kind === 'code' ? 'Твоята комбинация' : 'Твоят отговор'}</Label><Input id="game-answer" value={value} onChange={event => setValue(event.target.value)} disabled={disabled} autoComplete="off" inputMode={kind === 'code' ? 'numeric' : 'text'} pattern={kind === 'code' ? '[0-9]{4}' : undefined} minLength={kind === 'code' ? 4 : 1} maxLength={kind === 'code' ? 4 : 120} placeholder={kind === 'code' ? 'Например: 0123' : 'Напиши отговора от текста'} required className={kind === 'code' ? 'h-12 text-lg tracking-[0.4em]' : 'h-12'} /></div>
    <Button type="submit" disabled={disabled || !value.trim()} className="h-12">Провери отговора</Button>
  </form>;
}

export default function GameBoard({ session, busy, onAction }: Props) {
  const disabled = busy || session.status !== 'active';
  switch (session.game) {
    case 'quiz': {
      const { state } = session;
      return <div className="space-y-6">
        {state.question && <><p className="text-sm font-medium text-primary">Въпрос {state.answered+1} от 5</p><h2 className="text-xl font-bold leading-relaxed">{state.question.text}</h2><div className="grid gap-3">{state.question.options.map((option, index) => <Button key={`${state.answered}-${index}`} variant="outline" className="h-auto min-h-14 justify-start gap-3 whitespace-normal p-4 text-left" disabled={disabled} onClick={() => onAction({ choice: index })}><span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted font-bold">{String.fromCharCode(А_CODE + index)}</span><span>{option}</span></Button>)}</div></>}
        {state.review && <div className="space-y-4"><h2 className="text-xl font-bold">Отговори и обяснения</h2>{state.review.map((q, index) => <article key={q.text} className="rounded-xl border p-4"><p className="font-medium">{q.chosen === q.answer ? '✓' : '✕'} {index+1}. {q.text}</p><p className="mt-2 text-sm">Твоят отговор: {q.options[q.chosen]}</p><p className="mt-1 text-sm text-muted-foreground">{q.explanation}</p><a className="mt-2 inline-block text-sm text-primary underline" href={q.source} target="_blank" rel="noopener noreferrer">Източник</a></article>)}</div>}
      </div>;
    }
    case 'word': {
      const { state } = session;
      return <div className="space-y-8"><div className="text-center"><p className="text-sm text-muted-foreground">Подсказка</p><h2 className="mt-1 text-xl font-bold">{state.hint}</h2></div><div className="flex flex-wrap justify-center gap-2" aria-label={`Дума: ${state.masked.join(' ')}`}>{state.masked.map((letter, i) => <span key={i} className="flex h-12 w-9 items-center justify-center rounded-lg border-b-4 border-primary/40 bg-primary/5 text-xl font-bold sm:w-11">{letter}</span>)}</div><p className="text-center text-sm" role="status">Остават {state.remaining} грешни букви.</p><div className="mx-auto grid max-w-lg grid-cols-6 gap-2 sm:grid-cols-10">{Array.from('АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ').map(letter => <Button key={letter} variant={state.letters.includes(letter) ? 'secondary' : 'outline'} disabled={disabled || state.letters.includes(letter)} className="h-11 px-0" onClick={() => onAction({ letter })} aria-label={`Буква ${letter}`}>{letter}</Button>)}</div></div>;
    }
    case 'code': {
      const { state } = session;
      return <div className="space-y-6"><p className="text-sm text-muted-foreground">„Точно“ означава правилна цифра на правилно място. „Разместено“ означава правилна цифра на друго място.</p><div className="space-y-2" aria-label="Предишни опити">{state.guesses.map((row, index) => <div key={row.guess} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-4"><span className="font-mono text-xl font-bold tracking-[0.3em]">{row.guess}</span><span className="text-sm text-muted-foreground">#{index+1} · Точно: {row.exact} · Разместено: {row.misplaced}</span></div>)}</div><p role="status" className="text-sm">Остават {state.remaining} опита.</p>{state.solution ? <p className="rounded-xl bg-primary/10 p-4 font-bold">Комбинацията е {state.solution}.</p> : <TextAnswer key={session.revision} kind="code" disabled={disabled} onAction={onAction} />}</div>;
    }
    case 'robot': return <RobotBoard state={session.state} disabled={disabled} onAction={onAction} />;
    case 'memory': {
      const { state } = session;
      return <div className="space-y-6"><p className="text-center text-sm" role="status">Двойки: {state.matched.length/2}/8 · Ходове: {state.turns}/20</p><div className="mx-auto grid max-w-md grid-cols-4 gap-2 sm:gap-3">{state.cards.map((card, index) => <button type="button" key={index} className={`flex aspect-square items-center justify-center rounded-2xl border-2 text-3xl shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:text-4xl ${state.matched.includes(index) ? 'border-primary/40 bg-primary/10' : card ? 'border-border bg-background' : 'border-primary/20 bg-primary/5 hover:bg-primary/15'}`} aria-label={`Карта ${index+1}: ${card ?? 'затворена'}`} disabled={disabled || card !== null || state.open.length === 2} onClick={() => onAction({ index })}>{card ?? <span className="font-bold text-primary/40">?</span>}</button>)}</div>{state.open.length === 2 && !disabled && <div className="text-center"><Button onClick={() => onAction({ kind: 'close' })}>Запомних — затвори двойката</Button></div>}</div>;
    }
    case 'hunt': {
      const { state } = session;
      return <div className="space-y-6"><article className="rounded-2xl border bg-muted/30 p-5 sm:p-7"><p className="text-xs font-bold uppercase tracking-widest text-primary">От библиотеката на играта</p><h2 className="mb-4 mt-2 text-xl font-bold">{state.title}</h2><p className="whitespace-pre-line leading-8 text-muted-foreground">{state.text}</p></article><h3 className="text-lg font-bold">{state.question}</h3><p className="text-sm" role="status">Остават {state.remaining} опита.</p>{state.answers.length > 0 && <p className="text-sm text-muted-foreground">Твоите отговори: {state.answers.join(' · ')}</p>}{state.solution ? <p className="rounded-xl bg-primary/10 p-4 font-bold">Отговор: {state.solution}</p> : <TextAnswer key={session.revision} kind="hunt" disabled={disabled} onAction={onAction} />}</div>;
    }
  }
}

const А_CODE = 'А'.charCodeAt(0);
