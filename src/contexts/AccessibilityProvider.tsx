import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AccessibilityContext } from "@/contexts/accessibility-context";
import type { AccessibilityContextValue, AccessibilityPreferences } from "@/contexts/accessibility-context";

const STORAGE_KEY = "pgknma-accessibility-v1";
const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  fontScale: 100,
  highContrast: false,
  monochrome: false,
  reduceMotion: false,
};

function readPreferences(): AccessibilityPreferences {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<AccessibilityPreferences> | null;
    if (!saved) return {
      ...DEFAULT_PREFERENCES,
      reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    };
    return {
      fontScale: [90, 100, 110, 120].includes(saved.fontScale ?? 100) ? saved.fontScale ?? 100 : 100,
      highContrast: Boolean(saved.highContrast),
      monochrome: Boolean(saved.monochrome),
      reduceMotion: Boolean(saved.reduceMotion),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(readPreferences);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accessibility-font-size", `${preferences.fontScale}%`);
    root.dataset.accessibilityContrast = preferences.highContrast ? "high" : "default";
    root.dataset.accessibilityMonochrome = String(preferences.monochrome);
    root.dataset.accessibilityMotion = preferences.reduceMotion ? "reduce" : "default";
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // The preferences still work for the current session if storage is unavailable.
    }
  }, [preferences]);

  const update = useCallback((changes: Partial<AccessibilityPreferences>) => {
    setPreferences((current) => ({ ...current, ...changes }));
  }, []);
  const increaseFont = useCallback(() => setPreferences((current) => ({ ...current, fontScale: Math.min(120, current.fontScale + 10) })), []);
  const decreaseFont = useCallback(() => setPreferences((current) => ({ ...current, fontScale: Math.max(90, current.fontScale - 10) })), []);
  const resetFont = useCallback(() => update({ fontScale: 100 }), [update]);
  const toggleHighContrast = useCallback(() => setPreferences((current) => ({ ...current, highContrast: !current.highContrast })), []);
  const toggleMonochrome = useCallback(() => setPreferences((current) => ({ ...current, monochrome: !current.monochrome })), []);
  const toggleReduceMotion = useCallback(() => setPreferences((current) => ({ ...current, reduceMotion: !current.reduceMotion })), []);
  const resetAll = useCallback(() => setPreferences(DEFAULT_PREFERENCES), []);

  const value = useMemo<AccessibilityContextValue>(() => ({
    ...preferences,
    increaseFont,
    decreaseFont,
    resetFont,
    toggleHighContrast,
    toggleMonochrome,
    toggleReduceMotion,
    resetAll,
  }), [decreaseFont, increaseFont, preferences, resetAll, resetFont, toggleHighContrast, toggleMonochrome, toggleReduceMotion]);

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}
