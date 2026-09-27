import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Image, MessageSquare, Music, Settings, ShieldCheck, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { getGamificationProfile } from '@/lib/api';
import { formatSiteDate } from '@/lib/date-time';

const shortcuts = [
  { tab: 'songs', title: 'Моите песни', description: 'Предложенията ти за звънеца и техният статус.', icon: Music },
  { tab: 'memes', title: 'Моите мемета', description: 'Качените мемета и гласовете за тях.', icon: Image },
  { tab: 'comments', title: 'Моите коментари', description: 'Разговорите, в които участваш.', icon: MessageSquare },
] as const;

export default function ProfileOverview() {
  const { user } = useAuth();
  const progress = useQuery({
    queryKey: ['gamification-profile', user?.id],
    queryFn: getGamificationProfile,
    enabled: Boolean(user),
    staleTime: 30_000,
  });
  const data = progress.data;

  return (
    <div className="space-y-6">
      <section aria-label="Преглед на прогреса" className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-base font-bold"><Trophy className="size-5 text-primary" aria-hidden="true" />Твоят прогрес</h3>
          <Link to="/profile?tab=progress" className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-primary hover:underline">Виж всичко<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
        </div>
        {progress.isPending ? (
          <div role="status" aria-label="Зареждане на прогреса" className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((item) => <Skeleton key={item} className="h-20 rounded-xl" />)}
          </div>
        ) : progress.isError ? (
          <div role="status" className="space-y-3 text-sm">
            <p className="text-muted-foreground">В момента прогресът и последната активност не могат да се заредят.</p>
            <Button variant="outline" size="sm" onClick={() => void progress.refetch()}>Опитай отново</Button>
          </div>
        ) : data ? (
          <>
            <dl className="grid grid-cols-3 gap-3">
              {[
                { label: 'Точки', value: data.points },
                { label: 'Ниво', value: data.level?.number ?? '—' },
                { label: 'Значки', value: data.badges.filter((badge) => badge.earned).length },
              ].map(({ label, value }) => (
                <div key={label} className="min-w-0 rounded-xl border border-border/50 bg-background/60 p-3 sm:p-4">
                  <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums sm:text-3xl">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 space-y-2">
              <div className="flex flex-wrap justify-between gap-1 text-xs text-muted-foreground">
                <span>{data.level?.title || 'Начало на твоето участие'}</span>
                <span>{data.next_level ? `${data.points_to_next} точки до следващото ниво` : data.level ? 'Най-високо налично ниво' : 'Участвай в мисиите, за да напреднеш'}</span>
              </div>
              <Progress value={data.progress_percent} className="h-2" aria-label="Прогрес към следващото ниво" />
            </div>
          </>
        ) : null}
      </section>

      <section aria-labelledby="profile-participation-title">
        <h3 id="profile-participation-title" className="mb-3 text-base font-bold">Моето участие</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {shortcuts.map(({ tab, title, description, icon: Icon }) => (
            <Link key={tab} to={`/profile?tab=${tab}`} className="group rounded-2xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <div className="mb-3 flex items-center justify-between"><Icon className="size-5 text-primary" aria-hidden="true" /><ArrowUpRight className="size-4 text-muted-foreground" aria-hidden="true" /></div>
              <h4 className="text-sm font-bold">{title}</h4>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      {data && !progress.isError && (
        <section aria-labelledby="profile-activity-title" className="rounded-2xl border bg-card p-5">
          <h3 id="profile-activity-title" className="mb-4 text-base font-bold">Последна активност с точки</h3>
          {data.recent_transactions.length ? (
            <ul className="divide-y divide-border/60">
              {data.recent_transactions.slice(0, 4).map((activity) => (
                <li key={activity.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0"><p className="break-words text-sm [overflow-wrap:anywhere]">{activity.description}</p><p className="mt-1 text-xs text-muted-foreground">{formatSiteDate(activity.created_at)}</p></div>
                  <span className="shrink-0 rounded-lg bg-muted px-2 py-1 text-xs font-bold tabular-nums">{activity.points > 0 ? '+' : ''}{activity.points} т.</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm leading-relaxed text-muted-foreground">Все още няма активност с точки. Можеш да разгледаш мисиите в „Моят прогрес“.</p>}
        </section>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/profile?tab=settings" className="flex min-h-16 items-center gap-3 rounded-xl border bg-card p-4 text-sm font-semibold hover:bg-accent"><Settings className="size-5 shrink-0 text-primary" aria-hidden="true" />Редактирай профила</Link>
        <Link to="/profile?tab=sessions" className="flex min-h-16 items-center gap-3 rounded-xl border bg-card p-4 text-sm font-semibold hover:bg-accent"><ShieldCheck className="size-5 shrink-0 text-primary" aria-hidden="true" />Провери активните сесии</Link>
      </div>
    </div>
  );
}
