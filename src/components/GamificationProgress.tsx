import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Circle,
  CircleHelp,
  GraduationCap,
  Gift,
  Image as ImageIcon,
  LockKeyhole,
  Medal,
  Megaphone,
  MessageCircle,
  Music,
  Palette,
  Sparkles,
  Sprout,
  Star,
  Target,
  Trophy,
  Users,
  Vote,
  type LucideIcon,
} from 'lucide-react';

import { QueryErrorState } from '@/components/query/QueryStates';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import UserAvatar from '@/components/UserAvatar';
import SiteRoleBadge from '@/components/SiteRoleBadge';
import { Link } from 'react-router-dom';
import {
  getGamificationLeaderboard,
  getGamificationProfile,
  type GamificationBadge,
  type GamificationBadgeRarity,
  type LeaderboardEntry,
  type PublicDigitalReward,
  getCurrentProfile,
  selectDigitalReward,
  updateLeaderboardPreference,
} from '@/lib/api';
import { cn } from '@/lib/utils';
import { publicProfilePath } from '@/lib/public-profile';
import { safeRewardColor } from '@/lib/digital-rewards';
import { useAuth } from '@/hooks/use-auth';

const iconMap: Record<string, LucideIcon> = {
  award: Award,
  'book-open': BookOpen,
  'calendar-check': CalendarCheck,
  'graduation-cap': GraduationCap,
  image: ImageIcon,
  megaphone: Megaphone,
  'message-circle': MessageCircle,
  music: Music,
  sparkles: Sparkles,
  sprout: Sprout,
  star: Star,
  trophy: Trophy,
  users: Users,
  vote: Vote,
};

const rarityLabels: Record<GamificationBadgeRarity, string> = {
  common: 'Обикновена',
  rare: 'Рядка',
  epic: 'Епична',
  seasonal: 'Сезонна',
};

const rarityStyles: Record<GamificationBadgeRarity, string> = {
  common: 'border-slate-400/35 bg-slate-500/5',
  rare: 'border-blue-500/35 bg-blue-500/5',
  epic: 'border-violet-500/40 bg-violet-500/[0.07]',
  seasonal: 'border-amber-500/40 bg-amber-500/[0.07]',
};

const formatDate = (value: string) => new Intl.DateTimeFormat('bg-BG', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value));

const rewardKindLabels: Record<PublicDigitalReward['kind'], string> = {
  avatar_frame: 'Рамка за аватар',
  profile_border: 'Рамка за профил',
  profile_theme: 'Профилна тема',
  user_title: 'Потребителска титла',
  special_icon: 'Специална икона',
};

function BadgeCard({ badge }: { badge: GamificationBadge }) {
  const Icon = iconMap[badge.icon] || CircleHelp;
  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-4 transition-[transform,box-shadow,border-color] duration-300 motion-safe:hover:-translate-y-1 hover:shadow-lg',
        rarityStyles[badge.rarity],
        !badge.earned && 'border-border/60 bg-muted/30 grayscale-[0.65]',
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm ring-1 ring-border/60',
          badge.earned ? 'text-primary' : 'text-muted-foreground',
        )}>
          {badge.earned ? <Icon className="h-6 w-6" aria-hidden="true" /> : <LockKeyhole className="h-5 w-5" aria-hidden="true" />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold leading-tight">{badge.title}</h3>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
              {rarityLabels[badge.rarity]}
            </Badge>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {badge.description}
          </p>
          {badge.earned && badge.awarded_at && (
            <p className="mt-3 text-xs font-semibold text-primary">
              Получена на {formatDate(badge.awarded_at)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function GamificationProgress() {
  const { toast } = useToast();
  const { updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'weekly' | 'monthly' | 'all_time'>('weekly');
  const progressQuery = useQuery({
    queryKey: ['gamification-profile'],
    queryFn: getGamificationProfile,
    staleTime: 30_000,
  });
  const leaderboardQuery = useQuery({
    queryKey: ['gamification-leaderboard'],
    queryFn: getGamificationLeaderboard,
    staleTime: 30_000,
  });
  const preferenceMutation = useMutation({
    mutationFn: updateLeaderboardPreference,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['gamification-profile'] }),
        queryClient.invalidateQueries({ queryKey: ['gamification-leaderboard'] }),
      ]);
      toast({ title: 'Настройката е запазена' });
    },
    onError: (error: Error) => toast({
      title: 'Настройката не е запазена',
      description: error.message,
      variant: 'destructive',
    }),
  });
  const rewardMutation = useMutation({
    mutationFn: ({ key, selected }: { key: string; selected: boolean }) => (
      selectDigitalReward(key, selected)
    ),
    onSuccess: async (reward) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['gamification-profile'] }),
        queryClient.invalidateQueries({ queryKey: ['current-profile'] }),
        queryClient.invalidateQueries({ queryKey: ['public-user-profile'] }),
      ]);
      const currentProfile = await getCurrentProfile();
      updateUser(currentProfile.user);
      toast({
        title: reward.selected ? 'Наградата е активирана' : 'Наградата е свалена',
        description: reward.title,
      });
    },
    onError: (error: Error) => toast({
      title: 'Наградата не е променена',
      description: error.message,
      variant: 'destructive',
    }),
  });

  if (progressQuery.isLoading) {
    return (
      <div className="space-y-5" aria-label="Зареждане на прогреса">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => <Skeleton key={item} className="h-36 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (progressQuery.isError) {
    return (
      <QueryErrorState
        title="Прогресът не може да бъде зареден"
        message={progressQuery.error.message}
        onRetry={() => void progressQuery.refetch()}
      />
    );
  }

  const data = progressQuery.data;
  const earnedCount = data.badges.filter((badge) => badge.earned).length;
  const LevelIcon = data.level ? iconMap[data.level.icon] || Trophy : Trophy;
  const leaderboard = leaderboardQuery.data?.[leaderboardPeriod];
  const periodLabels = {
    weekly: 'Седмица',
    monthly: 'Месец',
    all_time: 'Общо',
  } as const;

  const leaderboardRow = (entry: LeaderboardEntry) => (
    <li
      key={`${leaderboardPeriod}-${entry.rank}-${entry.username}`}
      className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60"
    >
      <span className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black tabular-nums',
        entry.rank <= 3 ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-muted text-muted-foreground',
      )}>
        {entry.rank}
      </span>
      <Link to={publicProfilePath(entry.username)} aria-label={`Профил на ${entry.username}`} className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <UserAvatar username={entry.username} avatarUrl={entry.avatar_url} siteRole={entry.site_role} equippedRewards={entry.equipped_rewards} className="h-9 w-9" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <Link to={publicProfilePath(entry.username)} className="min-w-0 break-words font-semibold [overflow-wrap:anywhere] hover:text-primary hover:underline">{entry.username}</Link>
        <SiteRoleBadge role={entry.site_role} compact />
      </div>
      <span className="shrink-0 font-black tabular-nums text-primary">{entry.points}</span>
    </li>
  );

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-primary/25 shadow-xl shadow-primary/5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,hsl(var(--primary)/0.22),transparent_35%),linear-gradient(135deg,hsl(var(--primary)/0.08),transparent_55%)]" />
        <CardHeader className="relative gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 sm:h-20 sm:w-20">
              <LevelIcon className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Ниво {data.level?.number ?? 1}
              </p>
              <CardTitle className="mt-1 text-2xl sm:text-3xl">
                {data.level?.title ?? 'Новак'}
              </CardTitle>
              <CardDescription className="mt-1">
                Реалните ви участия в блога изграждат този прогрес.
              </CardDescription>
            </div>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-background/80 px-5 py-3 text-center backdrop-blur-sm">
            <p className="text-3xl font-black tabular-nums text-primary">{data.points}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">точки</p>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold">Прогрес до следващото ниво</span>
            <span className="tabular-nums text-muted-foreground">{data.progress_percent}%</span>
          </div>
          <Progress value={data.progress_percent} className="h-3 bg-primary/10" aria-label={`Прогрес ${data.progress_percent}%`} />
          <p className="mt-3 text-sm text-muted-foreground">
            {data.next_level
              ? `${data.points} / ${data.next_level.minimum_points} точки · остават ${data.points_to_next} до „${data.next_level.title}“.`
              : 'Достигнали сте най-високото ниво. Браво!'}
          </p>
        </CardContent>
      </Card>

      <section aria-labelledby="badges-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Постижения</p>
            <h2 id="badges-title" className="mt-1 text-2xl font-black tracking-tight">Моите значки</h2>
          </div>
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
            <Award className="h-4 w-4" aria-hidden="true" />
            {earnedCount} от {data.badges.length}
          </Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.badges.map((badge) => <BadgeCard key={badge.slug} badge={badge} />)}
        </div>
      </section>

      <section aria-labelledby="rewards-title">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Персонализация</p>
          <h2 id="rewards-title" className="mt-1 text-2xl font-black tracking-tight">Моите дигитални награди</h2>
          <p className="mt-1 text-sm text-muted-foreground">Изберете по една активна награда от всеки вид. Промяната се вижда веднага в профила и аватара.</p>
        </div>
        {data.rewards.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.rewards.map((reward) => {
              const color = safeRewardColor(reward.config.color, '#8b5cf6');
              const secondary = safeRewardColor(reward.config.secondary_color, '#22d3ee');
              return (
                <Card key={reward.key} className={cn('overflow-hidden transition-colors', reward.selected && 'border-violet-500/60 bg-violet-500/[0.05]')}>
                  <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${secondary})` }} />
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
                        {reward.kind === 'profile_theme' ? <Palette className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="break-words text-lg [overflow-wrap:anywhere]">{reward.title}</CardTitle>
                        <CardDescription>{rewardKindLabels[reward.kind]}</CardDescription>
                      </div>
                      {reward.selected && <Badge className="ml-auto bg-violet-600 text-white">Активна</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-xs text-muted-foreground">Отключена на {formatDate(reward.unlocked_at)}</p>
                    <Button
                      type="button"
                      variant={reward.selected ? 'outline' : 'default'}
                      className="w-full"
                      disabled={rewardMutation.isPending}
                      onClick={() => rewardMutation.mutate({ key: reward.key, selected: !reward.selected })}
                    >
                      {reward.selected ? 'Свали наградата' : 'Използвай наградата'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card><CardContent className="py-10 text-center text-muted-foreground">Все още нямате отключени дигитални награди.</CardContent></Card>
        )}
      </section>

      <section aria-labelledby="missions-title">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Предизвикателства</p>
          <h2 id="missions-title" className="mt-1 text-2xl font-black tracking-tight">Активни мисии</h2>
        </div>
        {data.missions.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {data.missions.map((mission) => (
              <Card key={mission.slug} className="overflow-hidden">
                <CardHeader className="border-b border-border/60 bg-gradient-to-r from-violet-500/10 to-transparent">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="flex items-start gap-2 break-words text-xl [overflow-wrap:anywhere]">
                        <Target className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" aria-hidden="true" />
                        <span>{mission.title}</span>
                      </CardTitle>
                      <CardDescription className="mt-1">{mission.description}</CardDescription>
                    </div>
                    <Badge className="shrink-0 bg-violet-600 text-white hover:bg-violet-600">
                      +{mission.reward_points}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 sm:pt-6">
                  <div className="mb-4 flex items-center gap-3">
                    <Progress value={mission.progress_percent} className="h-2.5" />
                    <span className="text-sm font-bold tabular-nums">{mission.progress_percent}%</span>
                  </div>
                  <ul className="space-y-3">
                    {mission.requirements.map((requirement) => (
                      <li key={requirement.key} className="flex items-start gap-2.5 text-sm">
                        {requirement.complete
                          ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                          : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                        <span className={cn('min-w-0 flex-1', requirement.complete && 'text-muted-foreground line-through')}>
                          {requirement.label}
                        </span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          {requirement.current}/{requirement.target}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    До {formatDate(mission.end_date)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="py-10 text-center text-muted-foreground">В момента няма активна мисия.</CardContent></Card>
        )}
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-amber-500/10 to-transparent">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-amber-500" aria-hidden="true" />
                Класация
              </CardTitle>
              <CardDescription className="mt-1 max-w-xl">
                Показването е доброволно. Споделят се само потребителско име, аватар и точки.
              </CardDescription>
            </div>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border bg-background/80 px-3 py-2.5 text-sm font-semibold sm:min-w-56">
              Участвам публично
              <Switch
                checked={data.leaderboard_opt_in}
                disabled={preferenceMutation.isPending}
                onCheckedChange={(checked) => preferenceMutation.mutate(checked)}
                aria-label="Участвам в публичната класация"
              />
            </label>
          </div>
        </CardHeader>
        <CardContent className="pt-5 sm:pt-6">
          <div className="mb-4 grid grid-cols-3 rounded-xl bg-muted/60 p-1" role="tablist" aria-label="Период на класацията">
            {(Object.keys(periodLabels) as Array<keyof typeof periodLabels>).map((period) => (
              <button
                key={period}
                type="button"
                role="tab"
                aria-selected={leaderboardPeriod === period}
                onClick={() => setLeaderboardPeriod(period)}
                className={cn(
                  'rounded-lg px-2 py-2 text-sm font-bold transition-colors',
                  leaderboardPeriod === period ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {periodLabels[period]}
              </button>
            ))}
          </div>
          {leaderboardQuery.isLoading ? (
            <div className="space-y-2"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
          ) : leaderboardQuery.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <p>Класацията не може да бъде заредена.</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => void leaderboardQuery.refetch()}>Опитай отново</Button>
            </div>
          ) : leaderboard?.top.length ? (
            <>
              <ol className="space-y-1">{leaderboard.top.map(leaderboardRow)}</ol>
              {leaderboard.current_user && !leaderboard.top.some((entry) => entry.rank === leaderboard.current_user?.rank && entry.username === leaderboard.current_user?.username) && (
                <div className="mt-4 border-t border-dashed border-border pt-3">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Вашата позиция</p>
                  {leaderboardRow(leaderboard.current_user)}
                </div>
              )}
            </>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">Все още няма участници с точки за този период.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            Последни точки
          </CardTitle>
          <CardDescription>Ясна история откъде идва всяка промяна в баланса.</CardDescription>
        </CardHeader>
        <CardContent className="pt-5 sm:pt-6">
          {data.recent_transactions.length ? (
            <ol className="divide-y divide-border/60">
              {data.recent_transactions.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className={cn(
                    'flex h-10 min-w-14 items-center justify-center rounded-xl px-2 text-sm font-black tabular-nums',
                    item.points > 0
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
                  )}>
                    {item.points > 0 ? '+' : ''}{item.points}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold leading-tight [overflow-wrap:anywhere]">{item.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
                  </div>
                  <span className="hidden text-xs tabular-nums text-muted-foreground sm:block">
                    Баланс: {item.balance_after}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Първите ви точки ще се появят тук след участие в блога.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
