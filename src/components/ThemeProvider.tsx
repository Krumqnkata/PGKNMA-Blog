import { useLayoutEffect } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { isDarkTheme } from "@/lib/themes";

const ThemeClassSynchronizer = () => {
  const { theme, resolvedTheme } = useTheme();

  useLayoutEffect(() => {
    const root = document.documentElement;
    const dark = isDarkTheme(theme, resolvedTheme);

    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
  }, [resolvedTheme, theme]);

  return null;
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeClassSynchronizer />
      {children}
    </NextThemesProvider>
  );
}
