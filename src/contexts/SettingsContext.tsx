import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSiteStatus, SiteStatus } from '@/lib/api'; // Assuming SiteStatus is exported from api.ts

interface SettingsContextType {
  settings: SiteStatus | null;
  isLoading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const fetchedSettings = await getSiteStatus();
        setSettings(fetchedSettings);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch site settings:", err);
        setError(err.message || "Failed to load site settings.");
        setSettings({ // Fallback to ensure UI can render even if API fails
            maintenance_mode: false,
            enable_bell_suggestions: true,
            enable_weekly_poll: true,
            enable_meme_of_the_week: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, error }}>
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
