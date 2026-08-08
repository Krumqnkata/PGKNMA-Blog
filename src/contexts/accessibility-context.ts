import { createContext } from "react";

export interface AccessibilityPreferences {
  fontScale: number;
  highContrast: boolean;
  monochrome: boolean;
  reduceMotion: boolean;
}

export interface AccessibilityContextValue extends AccessibilityPreferences {
  increaseFont: () => void;
  decreaseFont: () => void;
  resetFont: () => void;
  toggleHighContrast: () => void;
  toggleMonochrome: () => void;
  toggleReduceMotion: () => void;
  resetAll: () => void;
}

export const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);
