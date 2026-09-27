import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy } from 'lucide-react';

import { QueryErrorState } from '@/components/query/QueryStates';
import SiteRoleBadge from '@/components/SiteRoleBadge';
import UserAvatar from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { getGamificationLeaderboard, getGamificationProfile, type GamificationLeaderboard } from '@/lib/api';
import { publicProfilePath } from '@/lib/public-profile';
import { cn } from '@/lib/utils';

const periods = { weekly: 'Седмица', monthly: 'Месец', all_time: 'Общо' } as const;
type Period = keyof GamificationLeaderboard;

export default function GamificationStatistics() {
  const { user, isLoading, openLoginDialog } = useAuth();
  const [period, setPeriod] = useState<Period>('weekly');
  const leaderboard = useQuery({
    queryKey: ['gamification-leaderboard', user?.id ?? 'guest'],
    queryFn: getGamificationLeaderboard,
    enabled: !isLoading,
    staleTime: 30_000,
  });
  const profile = useQuery({
    queryKey: ['gamification-profile', user?.id],
    queryFn: getGamificationProfile,
    enabled: Boolean(user) && !isLoading,
    staleTime: 30_000,
  });

  return (
    <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)}>
      <TabsList className="mb-5 grid w-full grid-cols-3 sm:max-w-sm" aria-label="Период на класацията">
        {Object.entries(periods).map(([value, label]) => <TabsTrigger key={value} value={value}>{label}</TabsTrigger>)}
      </TabsList>
      {(Object.keys(periods) as Period[]).map((value) => {
        const ranking = leaderboard.data?.[value];
        const current = ranking?.current_user;
        return (
          <TabsContent key={value} value={value} className="space-y-5">
            {isLoading ? (
              <Skeleton className="h-36 rounded-2xl" aria-label="Зареждане на профила" />
            ) : user ? (
              <section aria-label="Твоята статистика" className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold">Твоето място · {periods[value]}</h3>
                  <Link to="/profile?tab=progress" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Моят прогрес в профила<ArrowRight className="size-4" aria-hidden="true" /></Link>
                </div>
                <dl className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Общо точки', amount: profile.isError ? '—' : profile.data?.points ?? '—', loading: profile.isPending },
                    { label: 'Място в класацията', amount: !leaderboard.isError && current ? `№ ${current.rank}` : '—', loading: leaderboard.isPending },
                    { label: 'Точки за периода', amount: !leaderboard.isError ? current?.points ?? '—' : '—', loading: leaderboard.isPending },
                  ].map(({ label, amount, loading }) => (
                    <div key={label} className="rounded-xl border border-border/50 bg-background/70 p-4">
                      <dt className="text-sm text-muted-foreground">{label}</dt>
                      <dd className="mt-2 text-3xl font-black tabular-nums text-primary">{loading ? <Skeleton className="h-9 w-20" aria-label={`Зареждане: ${label}`} /> : amount}</dd>
                    </div>
                  ))}
                </dl>
                {profile.isError ? (
                  <div className="mt-4 text-sm" role="status">
                    <p>Личната статистика не може да бъде заредена.</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => void profile.refetch()}>Зареди статистиката отново</Button>
                  </div>
                ) : profile.data?.leaderboard_opt_in === false ? (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">В момента не участваш в публичната класация. Можеш да включиш участието си от „Моят прогрес“ в профила.</p>
                ) : leaderboard.isSuccess && !current ? (
                  <p className="mt-4 text-sm text-muted-foreground">Все още нямаш място в класацията за този период. В нея участват профили с положителен брой точки за периода.</p>
                ) : null}
              </section>
            ) : (
              <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-relaxed text-muted-foreground">Влез, за да видиш своите точки и място в класацията.</p>
                <Button onClick={openLoginDialog}>Влез в профила си</Button>
              </div>
            )}

            <section aria-label={`Класация: ${periods[value]}`} className="rounded-2xl border bg-card p-4 sm:p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold"><Trophy className="size-5 text-primary" aria-hidden="true" />Водещи участници</h3>
              <p className="mb-5 mt-2 text-sm text-muted-foreground">До 10 участници с най-много точки за избрания период. Публичното участие е доброволно.</p>
              {leaderboard.isPending ? (
                <div role="status" aria-label="Зареждане на класацията" className="space-y-3">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-14 rounded-xl" />)}</div>
              ) : leaderboard.isError ? (
                <QueryErrorState title="Класацията не може да бъде заредена" onRetry={() => void leaderboard.refetch()} />
              ) : ranking?.top.length ? (
                <ol className="space-y-2">
                  {ranking.top.map((entry) => (
                    <li key={entry.username} className={cn('flex min-w-0 items-center gap-3 rounded-xl p-3', user?.username === entry.username ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-muted/40')}>
                      <span className={cn('shrink-0 text-lg font-black tabular-nums', entry.rank <= 3 ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground')} aria-label={`Място ${entry.rank}`}>{entry.rank}</span>
                      <UserAvatar username={entry.username} avatarUrl={entry.avatar_url} equippedRewards={entry.equipped_rewards} siteRole={entry.site_role} className="hidden size-10 shrink-0 min-[360px]:flex" />
                      <div className="min-w-0 flex-1">
                        <Link to={publicProfilePath(entry.username)} className="rounded font-semibold [overflow-wrap:anywhere] hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{entry.username}</Link>
                        {user?.username === entry.username && <span className="ml-2 text-xs text-primary">Ти</span>}
                        <SiteRoleBadge role={entry.site_role} compact className="ml-2" />
                      </div>
                      <span className="shrink-0 text-right font-bold tabular-nums text-primary">{entry.points}<span className="block text-xs font-normal text-muted-foreground">точки</span></span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">Все още няма участници с точки за този период.</p>
              )}
            </section>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
