import { createContext } from "react";

import type { SiteStatus } from "@/lib/api";

export interface SettingsContextValue {
  settings: SiteStatus | null;
  isLoading: boolean;
  error: string | null;
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);
