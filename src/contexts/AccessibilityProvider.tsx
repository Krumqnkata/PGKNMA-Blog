import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AccessibilityContext } from "@/contexts/accessibility-context";
import type { AccessibilityContextValue, AccessibilityPreferences, ColorVisionMode } from "@/contexts/accessibility-context";

const STORAGE_KEY = "pgknma-accessibility-v1";
const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  fontScale: 100,
  highContrast: false,
  monochrome: false,
  reduceMotion: false,
  dyslexiaFont: false,
  highlightLinks: false,
  enhancedFocus: false,
  readingGuide: false,
  largeCursor: false,
  colorVisionMode: "none",
};

const COLOR_VISION_MODES: ColorVisionMode[] = ["none", "protanopia", "deuteranopia", "tritanopia"];

// Gecko currently computes SVG fragment filters on the document root but does
// not paint them. Keep the filter on <html> (so fixed/sticky layout is not
// rebased) and use CSS filter functions as its Firefox-safe fallback.
const FIREFOX_COLOR_VISION_FILTERS: Record<ColorVisionMode, string> = {
  none: "none",
  protanopia: "grayscale(0.2) sepia(0.25) saturate(0.72) hue-rotate(-8deg) contrast(1.08)",
  deuteranopia: "grayscale(0.14) sepia(0.18) saturate(0.78) hue-rotate(12deg) contrast(1.06)",
  tritanopia: "grayscale(0.08) sepia(0.12) saturate(0.82) hue-rotate(-28deg) contrast(1.06)",
};

function readPreferences(): AccessibilityPreferences {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<AccessibilityPreferences> | null;
    if (!saved) return {
      ...DEFAULT_PREFERENCES,
      reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    };
    const colorVisionMode = COLOR_VISION_MODES.includes(saved.colorVisionMode ?? "none")
      ? saved.colorVisionMode ?? "none"
      : "none";
    return {
      fontScale: [90, 100, 110, 120].includes(saved.fontScale ?? 100) ? saved.fontScale ?? 100 : 100,
      highContrast: Boolean(saved.highContrast),
      monochrome: Boolean(saved.monochrome) && colorVisionMode === "none",
      reduceMotion: Boolean(saved.reduceMotion),
      dyslexiaFont: Boolean(saved.dyslexiaFont),
      highlightLinks: Boolean(saved.highlightLinks),
      enhancedFocus: Boolean(saved.enhancedFocus),
      readingGuide: Boolean(saved.readingGuide),
      largeCursor: Boolean(saved.largeCursor),
      colorVisionMode,
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
    root.dataset.accessibilityDyslexia = String(preferences.dyslexiaFont);
    root.dataset.accessibilityLinks = preferences.highlightLinks ? "highlight" : "default";
    root.dataset.accessibilityFocus = preferences.enhancedFocus ? "enhanced" : "default";
    root.dataset.accessibilityReadingGuide = String(preferences.readingGuide);
    root.dataset.accessibilityCursor = preferences.largeCursor ? "large" : "default";
    root.dataset.accessibilityColorVision = preferences.colorVisionMode;
    // Keep the SVG URL in an inline style so the fragment is resolved against
    // the document in both Vite development mode and production CSS bundles.
    // A stylesheet-local url(#id) can otherwise resolve against the CSS asset.
    const isFirefox = navigator.userAgent.includes("Firefox/");
    root.style.filter = preferences.monochrome
      ? "grayscale(1)"
      : preferences.colorVisionMode === "none"
        ? "none"
        : isFirefox
          ? FIREFOX_COLOR_VISION_FILTERS[preferences.colorVisionMode]
          : `url("#accessibility-${preferences.colorVisionMode}")`;
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
  const toggleMonochrome = useCallback(() => setPreferences((current) => ({
    ...current,
    monochrome: !current.monochrome,
    colorVisionMode: current.monochrome ? current.colorVisionMode : "none",
  })), []);
  const toggleReduceMotion = useCallback(() => setPreferences((current) => ({ ...current, reduceMotion: !current.reduceMotion })), []);
  const toggleDyslexiaFont = useCallback(() => setPreferences((current) => ({ ...current, dyslexiaFont: !current.dyslexiaFont })), []);
  const toggleHighlightLinks = useCallback(() => setPreferences((current) => ({ ...current, highlightLinks: !current.highlightLinks })), []);
  const toggleEnhancedFocus = useCallback(() => setPreferences((current) => ({ ...current, enhancedFocus: !current.enhancedFocus })), []);
  const toggleReadingGuide = useCallback(() => setPreferences((current) => ({ ...current, readingGuide: !current.readingGuide })), []);
  const toggleLargeCursor = useCallback(() => setPreferences((current) => ({ ...current, largeCursor: !current.largeCursor })), []);
  const setColorVisionMode = useCallback((colorVisionMode: ColorVisionMode) => setPreferences((current) => ({
    ...current,
    colorVisionMode,
    monochrome: colorVisionMode === "none" ? current.monochrome : false,
  })), []);
  const resetAll = useCallback(() => setPreferences(DEFAULT_PREFERENCES), []);

  const value = useMemo<AccessibilityContextValue>(() => ({
    ...preferences,
    increaseFont,
    decreaseFont,
    resetFont,
    toggleHighContrast,
    toggleMonochrome,
    toggleReduceMotion,
    toggleDyslexiaFont,
    toggleHighlightLinks,
    toggleEnhancedFocus,
    toggleReadingGuide,
    toggleLargeCursor,
    setColorVisionMode,
    resetAll,
  }), [decreaseFont, increaseFont, preferences, resetAll, resetFont, setColorVisionMode, toggleDyslexiaFont, toggleEnhancedFocus, toggleHighContrast, toggleHighlightLinks, toggleLargeCursor, toggleMonochrome, toggleReadingGuide, toggleReduceMotion]);

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}
