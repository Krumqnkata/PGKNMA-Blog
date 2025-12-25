import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query'; // New import
import { getSiteStatus, SiteStatus } from '@/lib/api';

interface SettingsContextType {
  settings: SiteStatus | null;
  isLoading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { data: settings, isLoading, error } = useQuery<SiteStatus, Error>({
    queryKey: ['siteSettings'],
    queryFn: getSiteStatus,
    refetchInterval: 60000, // Refetch every 60 seconds
    initialData: { // Provide initial data for immediate rendering, then update
        maintenance_mode: false,
        enable_bell_suggestions: true,
        enable_weekly_poll: true,
        enable_meme_of_the_week: true,
        enable_user_registration: true,
    },
  });

  return (
    <SettingsContext.Provider value={{ settings: settings || null, isLoading, error: error?.message || null }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
