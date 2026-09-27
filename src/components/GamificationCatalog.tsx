import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Award, BookOpen, CalendarCheck, Gift, GraduationCap, Image, Megaphone, MessageCircle, Music, Sparkles, Sprout, Star, Trophy, Users, Vote, type LucideIcon } from 'lucide-react';

import { InteriorSection, SectionHeading } from '@/components/InteriorPage';
import { ContentSkeleton, QueryErrorState } from '@/components/query/QueryStates';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { getGamificationCatalog, type CatalogBadge, type CatalogReward } from '@/lib/api';
import { formatSiteDate } from '@/lib/date-time';
import { avatarFrameStyle, profileBorderStyle, profileThemeStyle, rewardIcon, rewardTitles, safeRewardColor } from '@/lib/digital-rewards';

const icons: Record<string, LucideIcon> = {
  award: Award, 'book-open': BookOpen, 'calendar-check': CalendarCheck,
  'graduation-cap': GraduationCap, image: Image, megaphone: Megaphone,
  'message-circle': MessageCircle, music: Music, sparkles: Sparkles,
  sprout: Sprout, star: Star, trophy: Trophy, users: Users, vote: Vote,
};
const rarityLabels = { common: 'Обикновена', rare: 'Рядка', epic: 'Епична', seasonal: 'Сезонна' };
const kindLabels = {
  avatar_frame: 'Рамки за аватар', profile_border: 'Рамки за профил',
  profile_theme: 'Теми', user_title: 'Титли', special_icon: 'Икони',
};
const activityLinks: Record<string, { path: string; label: string }> = {
  post_read: { path: '/news', label: 'Към новините' },
  comment: { path: '/news', label: 'Намери тема' },
  calendar_visit: { path: '/events', label: 'Към календара' },
  poll_vote: { path: '/weekly-poll', label: 'Към анкетата' },
  song_approved: { path: '/bell-suggest', label: 'Предложи песен' },
  meme_approved: { path: '/meme-of-the-week', label: 'Към меметата' },
};

function RewardPreview({ reward }: { reward: CatalogReward }) {
  const visuals = [{ ...reward, selected: true }];
  const Icon = icons[rewardIcon(visuals) ?? 'sparkles'] ?? Sparkles;
  const color = safeRewardColor(reward.config.color, '#8b5cf6');
  return (
    <div className="flex min-h-36 items-center justify-center rounded-xl border bg-background p-5" aria-label={`Преглед: ${reward.title}`}>
      {reward.kind === 'avatar_frame' ? (
        <div style={avatarFrameStyle(visuals)} className="flex size-20 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground">А</div>
      ) : reward.kind === 'user_title' ? (
        <span className="max-w-full rounded-full border px-4 py-2 text-center text-sm font-bold [overflow-wrap:anywhere]" style={{ borderColor: color, color }}>{rewardTitles(visuals)[0]}</span>
      ) : reward.kind === 'special_icon' ? (
        <Icon className="size-12" style={{ color }} aria-hidden="true" />
      ) : (
        <div className="w-full max-w-56 rounded-xl border-2 bg-card p-4" style={{ ...profileBorderStyle(visuals), ...profileThemeStyle(visuals) }}>
          <div className="mb-3 size-8 rounded-full bg-muted" />
          <div className="h-2 w-2/3 rounded bg-foreground/20" />
          <div className="mt-2 h-2 w-full rounded bg-foreground/10" />
        </div>
      )}
    </div>
  );
}

function UnlockCondition({ badge }: { badge: CatalogBadge }) {
  return (
    <>
      <p className="text-sm leading-relaxed text-muted-foreground">{badge.condition}</p>
      {badge.ends_at && <p className="mt-1 text-xs text-muted-foreground">Налично до {formatSiteDate(badge.ends_at)}</p>}
    </>
  );
}

export default function GamificationCatalog() {
  const { user, openLoginDialog } = useAuth();
  const [filter, setFilter] = useState('all');
  const catalog = useQuery({
    queryKey: ['gamification-catalog'], queryFn: getGamificationCatalog, staleTime: 30_000,
  });
  const data = catalog.data;
  const filters = [
    { key: 'all', label: 'Всички' }, { key: 'badges', label: 'Значки' },
    ...Object.entries(kindLabels).map(([key, label]) => ({ key, label })),
  ];
  const rewards = data?.rewards.filter((reward) => filter === 'all' || filter === reward.kind) ?? [];
  const badges = filter === 'all' || filter === 'badges' ? data?.badges ?? [] : [];

  return (
    <>
      <InteriorSection className="border-y border-border/60 bg-muted/20">
        <div id="how-it-works" className="scroll-mt-24">
          <SectionHeading eyebrow="Всяко действие е от значение" title="Как се печелят точки?" description="Актуалните правила за участие. Дневният лимит е броят действия, за които се начисляват точки за един ден." />
          {catalog.isPending ? <ContentSkeleton variant="list" count={3} label="Зареждане на правилата" /> : catalog.isError ? (
            <QueryErrorState title="Правилата и наградите не могат да бъдат заредени" onRetry={() => void catalog.refetch()} />
          ) : data?.point_rules.length ? (
            <>
              <Table aria-label="Правила за печелене на точки" className="table-fixed">
                <TableHeader><TableRow>
                  <TableHead scope="col" className="w-[50%] px-2 text-[10px] tracking-normal sm:px-4 sm:text-xs">Действие и условия</TableHead>
                  <TableHead scope="col" className="w-[20%] px-2 text-[10px] tracking-normal sm:px-4 sm:text-xs">Точки</TableHead>
                  <TableHead scope="col" className="w-[30%] px-2 text-[10px] tracking-normal sm:px-4 sm:text-xs">Дневен лимит</TableHead>
                </TableRow></TableHeader>
                <TableBody>{data.point_rules.map((rule) => {
                  const link = activityLinks[rule.action];
                  return (
                    <TableRow key={rule.action}>
                      <TableCell className="p-2 sm:p-4">
                        <p className="font-semibold">{rule.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{rule.note}</p>
                        {rule.active && link && <Link to={link.path} className="mt-1 inline-flex min-h-11 items-center rounded text-xs font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{link.label}</Link>}
                      </TableCell>
                      <TableCell className="p-2 font-bold tabular-nums sm:p-4">{rule.active ? `+${rule.points}` : <span className="text-xs font-normal text-muted-foreground">Неактивно</span>}</TableCell>
                      <TableCell className="p-2 text-xs sm:p-4 sm:text-sm">{!rule.active ? '—' : rule.daily_limit === null ? 'Без дневен лимит' : `${rule.daily_limit} на ден`}</TableCell>
                    </TableRow>
                  );
                })}</TableBody>
              </Table>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Точките се отчитат след вход в профила. Дневните лимити се прилагат по часовата зона на сайта. Повторение на вече отчетено действие не носи нови точки.</p>
            </>
          ) : <p className="text-sm text-muted-foreground">В момента няма публикувани правила за точки.</p>}
        </div>
      </InteriorSection>

      <InteriorSection>
        <div id="levels" className="scroll-mt-24">
          <SectionHeading
            eyebrow="Стъпка по стъпка"
            title="Нивата в блога"
            description="Всяко ниво се достига с определен общ брой точки. Виж всички нива и точките, нужни за всяко от тях."
            action={!catalog.isError && data?.levels && <Badge variant="secondary" className="px-4 py-2 text-sm">Общо {data.levels.length} {data.levels.length === 1 ? 'ниво' : 'нива'}</Badge>}
          />
          {catalog.isPending ? <ContentSkeleton count={3} label="Зареждане на нивата" /> : catalog.isError || !data?.levels ? (
            <p className="text-sm text-muted-foreground">Информацията за нивата временно не е достъпна.</p>
          ) : data.levels.length ? (
            <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Всички нива">
              {data.levels.map((level, index) => {
                const Icon = icons[level.icon] ?? Trophy;
                return (
                  <li key={level.number} className="min-w-0 rounded-2xl border bg-card p-5 [overflow-wrap:anywhere]">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-6" aria-hidden="true" /></span>
                      {index === data.levels.length - 1 && <Badge variant="outline">Най-високо ниво</Badge>}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">Ниво {level.number}</p>
                    <h3 className="mt-1 text-lg font-bold">{level.title}</h3>
                    <p className="mt-3 text-sm tabular-nums text-muted-foreground">От {level.minimum_points.toLocaleString('bg-BG')} точки</p>
                  </li>
                );
              })}
            </ol>
          ) : <p className="text-sm text-muted-foreground">Все още няма добавени нива.</p>}
        </div>
      </InteriorSection>

      <InteriorSection>
        <div id="rewards" className="scroll-mt-24">
          <SectionHeading eyebrow="Намери следващата си цел" title="Открий наградите" description="Разгледай наличните значки и дигитални награди и виж как се отключват. Активираш спечелените награди от профила си." action={user ? <Button asChild variant="outline"><Link to="/profile?tab=progress">Към моите награди</Link></Button> : <Button variant="outline" onClick={openLoginDialog}>Влез за своите награди</Button>} />
          {catalog.isPending ? <ContentSkeleton count={3} label="Зареждане на наградите" /> : catalog.isError ? (
            <p className="text-sm text-muted-foreground">Каталогът временно е недостъпен. Използвай „Опитай отново“ при правилата по-горе.</p>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Вид награда">
                {filters.map(({ key, label }) => <Button key={key} variant={filter === key ? 'default' : 'outline'} size="sm" aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</Button>)}
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {badges.map((badge) => {
                  const Icon = icons[badge.icon] ?? Award;
                  return (
                    <article key={badge.slug} className="min-w-0 rounded-2xl border bg-card p-5 [overflow-wrap:anywhere]">
                      <div className="mb-4 flex min-h-36 items-center justify-center rounded-xl border border-primary/15 bg-primary/5"><Icon className="size-16 text-primary" aria-hidden="true" /></div>
                      <div className="mb-3 flex flex-wrap gap-2"><Badge variant="secondary">Значка</Badge><Badge variant="outline">{rarityLabels[badge.rarity]}</Badge>{badge.points_reward > 0 && <Badge variant="outline">+{badge.points_reward} точки</Badge>}</div>
                      <h3 className="text-lg font-bold">{badge.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{badge.description}</p>
                      <div className="mt-4 border-t pt-3"><p className="mb-1 text-xs font-bold uppercase tracking-wide">Как се отключва</p><UnlockCondition badge={badge} /></div>
                    </article>
                  );
                })}
                {rewards.map((reward) => (
                  <article key={reward.key} className="min-w-0 rounded-2xl border bg-card p-5 [overflow-wrap:anywhere]">
                    <RewardPreview reward={reward} />
                    <Badge variant="secondary" className="mb-3 mt-4">{kindLabels[reward.kind]}</Badge>
                    <h3 className="text-lg font-bold">{reward.title}</h3>
                    <div className="mt-4 border-t pt-3">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wide">{reward.badges.length > 1 ? 'Отключи с една от значките' : 'Отключи със значката'}</p>
                      <ul className="space-y-3">{reward.badges.map((badge) => <li key={badge.slug}><p className="mb-1 text-sm font-semibold">{badge.title}</p><UnlockCondition badge={badge} /></li>)}</ul>
                    </div>
                  </article>
                ))}
              </div>
              {!badges.length && !rewards.length && <div className="rounded-2xl border border-dashed p-8 text-center"><Gift className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden="true" /><p className="text-sm text-muted-foreground">В момента няма налични награди в тази категория.</p></div>}
            </>
          )}
        </div>
      </InteriorSection>
    </>
  );
}
