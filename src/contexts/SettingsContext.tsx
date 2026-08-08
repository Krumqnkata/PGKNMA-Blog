import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSiteStatus, SiteStatus } from '@/lib/api';
import { SettingsContext } from '@/contexts/settings-context';
import type { SettingsContextValue } from '@/contexts/settings-context';

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { data: settings, isLoading, error } = useQuery<SiteStatus, Error>({
    queryKey: ['siteStatus'],
    queryFn: getSiteStatus,
    refetchInterval: 30_000,
    retry: false,
  });

  const value = useMemo<SettingsContextValue>(() => ({
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
