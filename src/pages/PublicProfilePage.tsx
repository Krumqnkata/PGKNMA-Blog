import { useQuery } from '@tanstack/react-query';
import {
  Award,
  BookOpen,
  CalendarCheck,
  CircleHelp,
  ExternalLink,
  Gift,
  GraduationCap,
  Image as ImageIcon,
  LockKeyhole,
  Mail,
  Megaphone,
  MessageCircle,
  Music,
  Palette,
  Settings,
  Sparkles,
  Sprout,
  Star,
  Trophy,
  Users,
  Vote,
  type LucideIcon,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { InteriorPage, InteriorSection, SectionHeading } from '@/components/InteriorPage';
import { QueryErrorState } from '@/components/query/QueryStates';
import UserAvatar from '@/components/UserAvatar';
import SiteRoleBadge from '@/components/SiteRoleBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSEO } from '@/hooks/use-seo';
import {
  getPublicUserProfile,
  type GamificationBadgeRarity,
  type PublicDigitalReward,
} from '@/lib/api';
import { cn } from '@/lib/utils';
import { profileBorderStyle, profileThemeStyle, rewardIcon, rewardTitle } from '@/lib/digital-rewards';

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

const rewardLabels: Record<PublicDigitalReward['kind'], string> = {
  avatar_frame: 'Рамка за аватар',
  profile_border: 'Рамка за профил',
  profile_theme: 'Профилна тема',
  user_title: 'Титла',
  special_icon: 'Специална икона',
};

const formatDate = (value: string) => new Intl.DateTimeFormat('bg-BG', {
  dateStyle: 'medium',
}).format(new Date(value));

export default function PublicProfilePage() {
  const { username = '' } = useParams<{ username: string }>();
  const profileQuery = useQuery({
    queryKey: ['public-user-profile', username.toLocaleLowerCase('bg-BG')],
    queryFn: () => getPublicUserProfile(username),
    enabled: Boolean(username),
    staleTime: 60_000,
  });
  const profile = profileQuery.data;

  useSEO({
    title: profile ? `${profile.user.username} — профил` : 'Потребителски профил',
    description: profile?.bio || 'Публичен профил в ПГКНМА Блог.',
  });

  if (profileQuery.isLoading) {
    return (
      <InteriorPage>
        <InteriorSection className="pt-8 sm:pt-12">
          <div className="mx-auto max-w-5xl space-y-5" aria-label="Зареждане на профила">
            <Skeleton className="h-72 rounded-3xl" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => <Skeleton key={item} className="h-36 rounded-2xl" />)}
            </div>
          </div>
        </InteriorSection>
      </InteriorPage>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <InteriorPage>
        <InteriorSection className="pt-12" containerClassName="max-w-2xl">
          <QueryErrorState
            title="Профилът не е достъпен"
            message={profileQuery.error instanceof Error ? profileQuery.error.message : undefined}
            onRetry={username ? () => void profileQuery.refetch() : undefined}
          />
        </InteriorSection>
      </InteriorPage>
    );
  }

  const LevelIcon = profile.level ? iconMap[profile.level.icon] || Trophy : Trophy;
  const equippedRewards = profile.rewards.filter((reward) => reward.selected);
  const equippedTitle = rewardTitle(equippedRewards);
  const equippedIcon = rewardIcon(equippedRewards);
  const EquippedIcon = equippedIcon ? iconMap[equippedIcon] || Sparkles : null;
  const stats = [
    { label: 'Коментари', value: profile.stats.comments, Icon: MessageCircle },
    { label: 'Анкети', value: profile.stats.poll_answers, Icon: Vote },
    { label: 'Одобрени мемета', value: profile.stats.approved_memes, Icon: ImageIcon },
    { label: 'Одобрени песни', value: profile.stats.approved_songs, Icon: Music },
    { label: 'Значки', value: profile.stats.badges, Icon: Award },
    { label: 'Награди', value: profile.stats.rewards, Icon: Gift },
  ];

  return (
    <InteriorPage>
      <InteriorSection className="pt-8 sm:pt-12" containerClassName="max-w-6xl">
        <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-xl shadow-primary/5" style={profileBorderStyle(equippedRewards)}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,hsl(var(--primary)/0.24),transparent_38%),radial-gradient(circle_at_95%_100%,hsl(210_100%_55%/0.12),transparent_35%)]" style={profileThemeStyle(equippedRewards)} />
          <div className="relative flex flex-col gap-6 p-5 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <UserAvatar
                username={profile.user.username}
                avatarUrl={profile.user.avatar_url}
                siteRole={profile.user.site_role}
                equippedRewards={equippedRewards}
                className="h-24 w-24 border-4 border-background text-2xl shadow-xl sm:h-28 sm:w-28"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Публичен профил</p>
                <h1 className="mt-1 break-words text-3xl font-black tracking-tight sm:text-4xl">{profile.user.username}</h1>
                <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm text-muted-foreground sm:justify-start">
                  <Badge variant="secondary" className="gap-1.5">
                    <LevelIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Ниво {profile.level?.number ?? 1}: {profile.level?.title ?? 'Новак'}
                  </Badge>
                  <Badge variant="outline">{profile.points} точки</Badge>
                  <SiteRoleBadge role={profile.user.site_role} />
                  {equippedTitle && <Badge className="border-violet-400/50 bg-violet-500/15 text-violet-700 dark:text-violet-200">{equippedTitle}</Badge>}
                  {EquippedIcon && (
                    <Badge variant="outline" title={`Специална икона: ${equippedIcon}`}>
                      <EquippedIcon className="mr-1 h-3.5 w-3.5 text-violet-500" aria-hidden="true" />
                      Специална икона
                    </Badge>
                  )}
                </div>
                {profile.bio ? (
                  <p className="mt-4 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground sm:text-base">{profile.bio}</p>
                ) : (
                  <p className="mt-4 text-sm italic text-muted-foreground">Този потребител още не е добавил описание.</p>
                )}
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 rounded-2xl border border-border/70 bg-background/75 p-4 text-sm backdrop-blur-sm lg:w-auto lg:min-w-64">
              <p className="flex items-center gap-2 text-muted-foreground">
                <CalendarCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                В блога от {formatDate(profile.user.member_since)}
              </p>
              {profile.user.email && (
                <p className="flex min-w-0 items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <a className="truncate font-medium hover:text-primary hover:underline" href={`mailto:${profile.user.email}`}>{profile.user.email}</a>
                  {profile.is_owner && !profile.email_is_public && <Badge variant="outline" className="ml-auto shrink-0 text-[10px]">Само за вас</Badge>}
                </p>
              )}
              {profile.is_owner && !profile.profile_is_public && (
                <p className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                  Профилът е скрит за останалите
                </p>
              )}
              {profile.is_owner && (
                <Button asChild size="sm" className="mt-1">
                  <Link to="/profile?tab=settings"><Settings className="mr-2 h-4 w-4" />Настройки</Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        <section aria-label="Статистика на профила" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {stats.map(({ label, value, Icon }) => (
            <Card key={label} className="transition-[transform,box-shadow,border-color] duration-300 motion-safe:hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md">
              <CardContent className="flex items-center gap-3 p-4 sm:p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xl font-black tabular-nums">{value}</span>
                  <span className="block text-xs leading-tight text-muted-foreground">{label}</span>
                </span>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-12" aria-labelledby="profile-badges-title">
          <SectionHeading
            eyebrow="Постижения"
            title={<span id="profile-badges-title">Спечелени значки</span>}
            description="Значки, отключени чрез реално участие в блога."
          />
          {profile.badges.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.badges.map((badge) => {
                const Icon = iconMap[badge.icon] || CircleHelp;
                return (
                  <Card key={`${badge.slug}-${badge.awarded_at}`} className="group overflow-hidden transition-[transform,box-shadow,border-color] duration-300 motion-safe:hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                    <CardContent className="flex items-start gap-4 p-5">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-transform duration-300 motion-safe:group-hover:scale-105">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold">{badge.title}</h3>
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">{rarityLabels[badge.rarity]}</Badge>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{badge.description}</p>
                        <p className="mt-3 text-xs font-semibold text-primary">Получена на {formatDate(badge.awarded_at)}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Все още няма спечелени значки.</CardContent></Card>
          )}
        </section>

        <section className="mt-12" aria-labelledby="profile-rewards-title">
          <SectionHeading
            eyebrow="Колекция"
            title={<span id="profile-rewards-title">Дигитални награди</span>}
            description="Рамки, теми, титли и специални награди, отключени от постижения."
          />
          {profile.rewards.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.rewards.map((reward) => (
                <Card key={reward.key} className={cn('overflow-hidden', reward.selected && 'border-violet-500/40 bg-violet-500/[0.04]')}>
                  <CardHeader className="flex-row items-start gap-3 space-y-0">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
                      {reward.kind === 'profile_theme' ? <Palette className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0">
                      <CardTitle className="text-lg">{reward.title}</CardTitle>
                      <CardDescription>{rewardLabels[reward.kind]}</CardDescription>
                    </div>
                    {reward.selected && <Badge className="ml-auto shrink-0 bg-violet-600 text-white">Избрана</Badge>}
                  </CardHeader>
                  <CardContent>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-violet-500" aria-hidden="true" />
                      Отключена на {formatDate(reward.unlocked_at)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Все още няма отключени дигитални награди.</CardContent></Card>
          )}
        </section>

        <section className="mt-12" aria-labelledby="profile-comments-title">
          <SectionHeading
            eyebrow="Участие"
            title={<span id="profile-comments-title">Последни коментари</span>}
            description="Последни мнения, оставени към публични публикации."
            action={profile.is_owner && !profile.comments_are_public ? <Badge variant="outline"><LockKeyhole className="mr-1.5 h-3.5 w-3.5" />Видими само за вас</Badge> : undefined}
          />
          {!profile.comments_visible ? (
            <Card><CardContent className="flex items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground"><LockKeyhole className="h-4 w-4" />Потребителят е скрил списъка с коментари.</CardContent></Card>
          ) : profile.recent_comments.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {profile.recent_comments.map((comment) => (
                <Card key={comment.id} className="group transition-[box-shadow,border-color] duration-300 hover:border-primary/25 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg leading-snug">
                      <Link className="hover:text-primary hover:underline" to={`/post/${comment.post_id}`}>{comment.post_title}</Link>
                    </CardTitle>
                    <CardDescription>{formatDate(comment.created_at)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{comment.content}</p>
                    <Button asChild variant="link" className="mt-3 h-auto p-0">
                      <Link to={`/post/${comment.post_id}`}>Към публикацията<ExternalLink className="ml-1.5 h-3.5 w-3.5" /></Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Няма коментари към публични публикации.</CardContent></Card>
          )}
        </section>
      </InteriorSection>
    </InteriorPage>
  );
}
