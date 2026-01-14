import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AccountSettings from '@/components/AccountSettings';
import MyCommentsList from '@/components/MyCommentsList';
import MySongSuggestionsList from '@/components/MySongSuggestionsList';
import MyMemesList from '@/components/MyMemesList';
import RulesContent from '@/components/RulesContent'; // Import the new component
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { User, Music, MessageSquare, Image as ImageIcon, Shield } from 'lucide-react'; // Import Shield icon
import { useLocation } from 'react-router-dom'; // Import useLocation
import BackToTop from '@/components/BackToTop';

const MyProfilePage: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();

  // Initialize activeTab from URL query parameter, default to 'settings'
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'settings';
  });

  // Update activeTab when URL search params change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    } else if (!tabFromUrl && activeTab !== 'settings') {
      setActiveTab('settings');
    }
  }, [location.search]);

  const tabs = [
    { value: 'settings', label: 'Настройки', Icon: User },
    { value: 'songs', label: 'Моите песни', Icon: Music },
    { value: 'memes', label: 'Моите мемета', Icon: ImageIcon },
    { value: 'comments', label: 'Моите коментари', Icon: MessageSquare },
    { value: 'rules', label: 'Правила', Icon: Shield }, // Add the new tab
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Моят профил</h1>
          <p className="text-lg text-muted-foreground">Добре дошли, {user?.username || 'потребител'}!</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="settings" className="w-full">
          {isMobile ? (
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
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
            <TabsList className="grid w-full grid-cols-5"> 
              {tabs.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  <tab.Icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          )}

          {tabs.map(tab => (
            <TabsContent key={tab.value} value={tab.value} className="mt-6">
              {tab.value === 'settings' && <AccountSettings />}
              {tab.value === 'songs' && <MySongSuggestionsList />}
              {tab.value === 'memes' && <MyMemesList />}
              {tab.value === 'comments' && <MyCommentsList />}
              {tab.value === 'rules' && <RulesContent />} 
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <BackToTop />
    </MainLayout>
  );
};

export default MyProfilePage;