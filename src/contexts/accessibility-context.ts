import { createContext } from "react";

export type ColorVisionMode = "none" | "protanopia" | "deuteranopia" | "tritanopia";

export interface AccessibilityPreferences {
  fontScale: number;
  highContrast: boolean;
  monochrome: boolean;
  reduceMotion: boolean;
  dyslexiaFont: boolean;
  highlightLinks: boolean;
  enhancedFocus: boolean;
  readingGuide: boolean;
  largeCursor: boolean;
  colorVisionMode: ColorVisionMode;
}

export interface AccessibilityContextValue extends AccessibilityPreferences {
  increaseFont: () => void;
  decreaseFont: () => void;
  resetFont: () => void;
  toggleHighContrast: () => void;
  toggleMonochrome: () => void;
  toggleReduceMotion: () => void;
  toggleDyslexiaFont: () => void;
  toggleHighlightLinks: () => void;
  toggleEnhancedFocus: () => void;
  toggleReadingGuide: () => void;
  toggleLargeCursor: () => void;
  setColorVisionMode: (mode: ColorVisionMode) => void;
  resetAll: () => void;
}

export const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);
