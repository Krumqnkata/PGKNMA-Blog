import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AccountSettings from '@/components/AccountSettings';
import MyCommentsList from '@/components/MyCommentsList';
import MySongSuggestionsList from '@/components/MySongSuggestionsList';
import MyMemesList from '@/components/MyMemesList';
import RulesContent from '@/components/RulesContent'; // Import the new component
import LoginSessions from '@/components/LoginSessions';
import GamificationProgress from '@/components/GamificationProgress';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { User, Music, MessageSquare, Image as ImageIcon, Shield, History, Trophy } from 'lucide-react'; // Import Shield icon
import { useLocation } from 'react-router-dom'; // Import useLocation
import UserAvatar from '@/components/UserAvatar';
import SiteRoleBadge from '@/components/SiteRoleBadge';
import { InteriorPage, InteriorSection } from '@/components/InteriorPage';

const MyProfilePage: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();

  // Initialize activeTab from URL query parameter, default to 'settings'
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'settings';
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setActiveTab(params.get('tab') || 'settings');
  }, [location.search]);

  const tabs = [
    { value: 'settings', label: 'Настройки', Icon: User },
    { value: 'progress', label: 'Моят прогрес', Icon: Trophy },
    { value: 'songs', label: 'Моите песни', Icon: Music },
    { value: 'memes', label: 'Моите мемета', Icon: ImageIcon },
    { value: 'comments', label: 'Моите коментари', Icon: MessageSquare },
    { value: 'sessions', label: 'Сесии', Icon: History },
    { value: 'rules', label: 'Правила', Icon: Shield }, // Add the new tab
  ];

  return (
    <InteriorPage>
      <InteriorSection className="pt-8 sm:pt-12">
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-xl shadow-primary/5 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,hsl(var(--primary)/0.18),transparent_38%),linear-gradient(120deg,transparent_55%,hsl(210_100%_55%/0.08))]" aria-hidden="true" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <UserAvatar
            username={user?.username}
            avatarUrl={user?.avatar_url}
            siteRole={user?.site_role}
            equippedRewards={user?.equipped_rewards}
            className="h-20 w-20 border-4 border-background shadow-xl sm:h-24 sm:w-24"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Лично пространство</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Моят профил</h1>
            <SiteRoleBadge role={user?.site_role} className="mt-2" />
            <p className="mt-1 break-words text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere] sm:text-base">Добре дошли, <span className="font-bold text-foreground">{user?.username || 'потребител'}</span>. Управлявайте профила и активността си.</p>
          </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="settings" className="w-full">
          {isMobile ? (
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="h-12 w-full bg-card">
                <SelectValue placeholder="Изберете секция" />
              </SelectTrigger>
              <SelectContent>
                {tabs.map(tab => (
                  <SelectItem key={tab.value} value={tab.value}>
                    <div className="flex items-center">
                      <tab.Icon className="mr-2 h-4 w-4" />
                      {tab.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <TabsList className="grid h-auto w-full grid-cols-3 gap-1 bg-card/80 p-2 shadow-sm lg:grid-cols-4 xl:grid-cols-7">
              {tabs.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="min-h-12 whitespace-normal px-2 text-center leading-tight">
                  <tab.Icon className="mr-1.5 h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          )}

          {tabs.map(tab => (
            <TabsContent key={tab.value} value={tab.value} className="mt-7 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2">
              {tab.value === 'settings' && <AccountSettings />}
              {tab.value === 'progress' && <GamificationProgress />}
              {tab.value === 'songs' && <MySongSuggestionsList />}
              {tab.value === 'memes' && <MyMemesList />}
              {tab.value === 'comments' && <MyCommentsList />}
              {tab.value === 'sessions' && <LoginSessions />}
              {tab.value === 'rules' && <RulesContent />} 
            </TabsContent>
          ))}
        </Tabs>
      </InteriorSection>
    </InteriorPage>
  );
};

export default MyProfilePage;
