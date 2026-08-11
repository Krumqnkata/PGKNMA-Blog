import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSiteStatus, SiteStatus } from '@/lib/api';
import { SettingsContext } from '@/contexts/settings-context';
import type { SettingsContextValue } from '@/contexts/settings-context';

const SITE_STATUS_CACHE_KEY = 'pgknma-site-status-v1';

const SAFE_DEFAULT_SETTINGS: SiteStatus = {
  maintenance_mode: false,
  enable_bell_suggestions: true,
  enable_weekly_poll: true,
  enable_meme_of_the_week: true,
  enable_user_registration: true,
  enable_program_page: true,
};

interface CachedSiteStatus {
  settings: SiteStatus;
  savedAt: number;
}

const readCachedSiteStatus = (): CachedSiteStatus | null => {
  try {
    const value = localStorage.getItem(SITE_STATUS_CACHE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as CachedSiteStatus;
    return parsed?.settings && Number.isFinite(parsed.savedAt) ? parsed : null;
  } catch {
    return null;
  }
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const cached = useMemo(readCachedSiteStatus, []);
  const query = useQuery<SiteStatus, Error>({
    queryKey: ['siteStatus'],
    queryFn: getSiteStatus,
    initialData: cached?.settings ?? SAFE_DEFAULT_SETTINGS,
    initialDataUpdatedAt: cached?.savedAt ?? 0,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
    retry: 3,
    retryDelay: (attempt) => Math.min(1_000 * (2 ** attempt), 10_000),
  });

  useEffect(() => {
    if (!query.isFetchedAfterMount || query.isError || !query.data) return;
    try {
      localStorage.setItem(SITE_STATUS_CACHE_KEY, JSON.stringify({
        settings: query.data,
        savedAt: Date.now(),
      }));
    } catch {
      // Storage can be unavailable in private mode; the in-memory fallback remains active.
    }
  }, [query.data, query.isError, query.isFetchedAfterMount]);

  const value = useMemo<SettingsContextValue>(() => ({
    settings: query.data ?? SAFE_DEFAULT_SETTINGS,
    isLoading: false,
    error: query.error?.message ?? null,
  }), [query.data, query.error]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
