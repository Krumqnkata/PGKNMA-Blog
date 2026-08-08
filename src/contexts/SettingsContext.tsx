import { createContext, useContext, useMemo, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSiteStatus, SiteStatus } from '@/lib/api';

interface SettingsContextType {
  settings: SiteStatus | null;
  isLoading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { data: settings, isLoading, error } = useQuery<SiteStatus, Error>({
    queryKey: ['siteStatus'],
    queryFn: getSiteStatus,
    refetchInterval: 30_000,
    retry: false,
  });

  const value = useMemo<SettingsContextType>(() => ({
    settings: settings ?? null,
    isLoading,
    error: error?.message ?? null,
  }), [error, isLoading, settings]);

  return (
    <SettingsContext.Provider value={value}>
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
