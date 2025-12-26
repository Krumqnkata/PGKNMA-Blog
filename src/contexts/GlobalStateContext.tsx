import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getSiteStatus,
  getEvents,
  getPosts,
  getWeeklyPollStatus,
  getApprovedSongs,
  getMemes,
  getNotifications,
  SiteStatus,
  Event,
  Post,
  UserPollStatus,
  ApprovedSong,
  Meme,
  Notification
} from '@/lib/api';

const REFETCH_INTERVAL_MS = 60 * 1000; // 1 minute

interface GlobalState {
  siteStatus: { data?: SiteStatus; isLoading: boolean; error: Error | null; };
  events: { data?: Event[]; isLoading: boolean; error: Error | null; };
  posts: { data?: Post[]; isLoading: boolean; error: Error | null; };
  pollStatus: { data?: UserPollStatus; isLoading: boolean; error: Error | null; };
  approvedSongs: { data?: ApprovedSong[]; isLoading: boolean; error: Error | null; };
  memes: { data?: Meme[]; isLoading: boolean; error: Error | null; };
  notifications: { data?: Notification[]; isLoading: boolean; error: Error | null; };
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  const siteStatusQuery = useQuery<SiteStatus, Error>({
    queryKey: ['siteStatus'],
    queryFn: getSiteStatus,
    refetchInterval: REFETCH_INTERVAL_MS,
    retry: false,
  });

  const eventsQuery = useQuery<Event[], Error>({
    queryKey: ['events'],
    queryFn: getEvents,
    refetchInterval: REFETCH_INTERVAL_MS,
    retry: false,
  });

  const postsQuery = useQuery<Post[] | null, Error>({
    queryKey: ['posts'],
    queryFn: getPosts,
    refetchInterval: REFETCH_INTERVAL_MS,
    retry: false,
  });

  const pollStatusQuery = useQuery<UserPollStatus, Error>({
    queryKey: ['weeklyPollStatus'],
    queryFn: getWeeklyPollStatus,
    refetchInterval: REFETCH_INTERVAL_MS,
    retry: false,
  });

  const approvedSongsQuery = useQuery<ApprovedSong[], Error>({
    queryKey: ['approvedSongs'],
    queryFn: getApprovedSongs,
    refetchInterval: REFETCH_INTERVAL_MS,
    retry: false,
  });

  const memesQuery = useQuery<Meme[], Error>({
    queryKey: ['memes'],
    queryFn: getMemes,
    refetchInterval: REFETCH_INTERVAL_MS,
    retry: false,
  });
  
  const notificationsQuery = useQuery<Notification[], Error>({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: REFETCH_INTERVAL_MS,
    retry: false,
  });

  const value: GlobalState = {
    siteStatus: { data: siteStatusQuery.data, isLoading: siteStatusQuery.isLoading, error: siteStatusQuery.error },
    events: { data: eventsQuery.data, isLoading: eventsQuery.isLoading, error: eventsQuery.error },
    posts: { data: postsQuery.data ?? undefined, isLoading: postsQuery.isLoading, error: postsQuery.error },
    pollStatus: { data: pollStatusQuery.data, isLoading: pollStatusQuery.isLoading, error: pollStatusQuery.error },
    approvedSongs: { data: approvedSongsQuery.data, isLoading: approvedSongsQuery.isLoading, error: approvedSongsQuery.error },
    memes: { data: memesQuery.data, isLoading: memesQuery.isLoading, error: memesQuery.error },
    notifications: { data: notificationsQuery.data, isLoading: notificationsQuery.isLoading, error: notificationsQuery.error },
    notificationsEnabled,
    setNotificationsEnabled,
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
