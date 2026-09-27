import { lazy, Suspense, useEffect, useRef } from 'react';
import { Archive, Eye, History, Image, LayoutDashboard, LogOut, MessageSquare, Music, Settings, Shield, Trophy } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import ProfileOverview from '@/components/account/ProfileOverview';
import { InteriorPage, InteriorSection } from '@/components/InteriorPage';
import SiteRoleBadge from '@/components/SiteRoleBadge';
import UserAvatar from '@/components/UserAvatar';
import { ContentSkeleton } from '@/components/query/QueryStates';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { publicProfilePath } from '@/lib/public-profile';
import { cn } from '@/lib/utils';

const sections = [
  { value: 'overview', label: 'Общ преглед', description: 'Твоето участие и най-важното за профила ти на едно място.', icon: LayoutDashboard, group: 'Начало', component: ProfileOverview },
  { value: 'progress', label: 'Моят прогрес', description: 'Точки, значки, мисии и награди за участието ти.', icon: Trophy, group: 'Начало', component: lazy(() => import('@/components/GamificationProgress')) },
  { value: 'songs', label: 'Моите песни', description: 'Следи предложенията си за училищния звънец.', icon: Music, group: 'Моето участие', component: lazy(() => import('@/components/MySongSuggestionsList')) },
  { value: 'memes', label: 'Моите мемета', description: 'Прегледай качените мемета и техния статус.', icon: Image, group: 'Моето участие', component: lazy(() => import('@/components/MyMemesList')) },
  { value: 'comments', label: 'Моите коментари', description: 'Прегледай коментарите си в публикациите.', icon: MessageSquare, group: 'Моето участие', component: lazy(() => import('@/components/MyCommentsList')) },
  { value: 'notifications', label: 'Архив известия', description: 'Намери запазените в архива известия.', icon: Archive, group: 'Моето участие', component: lazy(() => import('@/components/ArchivedNotifications')) },
  { value: 'settings', label: 'Настройки', description: 'Персонализирай профила, предпочитанията и данните си за вход.', icon: Settings, group: 'Моят акаунт', component: lazy(() => import('@/components/AccountSettings')) },
  { value: 'sessions', label: 'Активни сесии', description: 'Виж устройствата и управлявай достъпа до акаунта си.', icon: History, group: 'Моят акаунт', component: lazy(() => import('@/components/LoginSessions')) },
  { value: 'rules', label: 'Правила', description: 'Правилата за участие в училищната общност.', icon: Shield, group: 'Моят акаунт', component: lazy(() => import('@/components/RulesContent')) },
] as const;
const groups = ['Начало', 'Моето участие', 'Моят акаунт'];

export default function MyProfilePage() {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const active = sections.find(({ value }) => value === searchParams.get('tab')) ?? sections[0];
  const Content = active.component;
  const navigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const navigation = navigationRef.current;
    const selected = navigation?.querySelector('[aria-current="page"]');
    if (navigation && selected && navigation.scrollWidth > navigation.clientWidth) {
      navigation.scrollLeft += selected.getBoundingClientRect().left - navigation.getBoundingClientRect().left - 8;
    }
  }, [active.value]);

  return (
    <InteriorPage className="overflow-clip">
      <InteriorSection className="py-6 sm:py-8">
        <header className="mb-6 flex flex-col gap-5 rounded-2xl border bg-card p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <UserAvatar username={user?.username} avatarUrl={user?.avatar_url} siteRole={user?.site_role} equippedRewards={user?.equipped_rewards} className="size-14 shrink-0 sm:size-16" />
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Моят профил</h1>
              <p className="mt-1 break-words text-sm text-muted-foreground [overflow-wrap:anywhere]">{user?.username}</p>
              <SiteRoleBadge role={user?.site_role} className="mt-2" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" className="min-h-10 gap-2"><Link to="/profile?tab=settings"><Settings className="size-4" aria-hidden="true" />Настройки</Link></Button>
            {user && <Button asChild size="sm" variant="outline" className="min-h-10 gap-2"><Link to={publicProfilePath(user.username)}><Eye className="size-4" aria-hidden="true" />Публичен профил</Link></Button>}
            <Button variant="ghost" size="icon" onClick={() => void logout()} aria-label="Изход от профила" title="Изход"><LogOut className="size-4" aria-hidden="true" /></Button>
          </div>
        </header>

        <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
          <nav ref={navigationRef} aria-label="Раздели на профила" className="flex min-w-0 gap-2 overflow-x-auto rounded-2xl border bg-card p-2 xl:sticky xl:top-[calc(var(--site-header-height)+env(safe-area-inset-top,0px)+1rem)] xl:block xl:space-y-5 xl:p-3">
            {groups.map((group) => (
              <div key={group} className="flex shrink-0 gap-1 xl:block xl:space-y-1">
                <p className="hidden px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground xl:block">{group}</p>
                {sections.filter((section) => section.group === group).map(({ value, label, icon: Icon }) => (
                  <Link key={value} to={`/profile?tab=${value}`} aria-current={active.value === value ? 'page' : undefined} className={cn(
                    'flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active.value === value ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}>
                    <Icon className="size-4 shrink-0" aria-hidden="true" />{label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <section aria-labelledby="profile-section-title" className="min-w-0">
            <div className="mb-5">
              <h2 id="profile-section-title" className="text-xl font-bold">{active.label}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{active.description}</p>
            </div>
            <Suspense fallback={<ContentSkeleton variant="detail" label="Зареждане на раздела" />}>
              <Content key={active.value} />
            </Suspense>
          </section>
        </div>
      </InteriorSection>
    </InteriorPage>
  );
}
