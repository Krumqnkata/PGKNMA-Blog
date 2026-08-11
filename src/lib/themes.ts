export const SITE_THEME_NAMES = [
  "light",
  "dark",
  "school",
  "ocean",
  "forest",
  "midnight",
] as const;

export type SiteTheme = (typeof SITE_THEME_NAMES)[number];
export type ThemePreference = SiteTheme | "system";

const DARK_SITE_THEMES = new Set<SiteTheme>(["dark", "ocean", "midnight"]);

export const isDarkTheme = (theme?: string, resolvedTheme?: string) => {
  if (theme === "system" || !theme) {
    return resolvedTheme === "dark";
  }

  return DARK_SITE_THEMES.has(theme as SiteTheme);
};
