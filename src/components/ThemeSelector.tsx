import { Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { SiteArt, type SiteArtName } from "@/components/art/SiteArt";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ThemePreference } from "@/lib/themes";

export type ThemeOption = {
  value: ThemePreference;
  label: string;
  description: string;
  art: SiteArtName;
  colors: readonly [string, string, string];
};

export const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    value: "system",
    label: "Автоматична",
    description: "Следва устройството",
    art: "laptop",
    colors: ["#f8fafc", "#64748b", "#0f172a"],
  },
  {
    value: "light",
    label: "Светла",
    description: "Чиста и светла",
    art: "sun",
    colors: ["#f1f8f8", "#14b8a6", "#123838"],
  },
  {
    value: "dark",
    label: "Тъмна",
    description: "Класическа тъмна",
    art: "moon",
    colors: ["#0d2626", "#2dd4bf", "#ecfdfb"],
  },
  {
    value: "school",
    label: "Училищна",
    description: "Тюркоаз и златисто",
    art: "cap",
    colors: ["#fbf8ef", "#0f8f83", "#e6ad24"],
  },
  {
    value: "ocean",
    label: "Океан",
    description: "Дълбоко синьо и циан",
    art: "wave",
    colors: ["#0d1b31", "#22d3ee", "#dff8ff"],
  },
  {
    value: "forest",
    label: "Горска",
    description: "Спокойни зелени тонове",
    art: "tree",
    colors: ["#f2f7ed", "#2f855a", "#183a2a"],
  },
  {
    value: "midnight",
    label: "Полунощ",
    description: "Мастилено и виолетово",
    art: "star",
    colors: ["#101020", "#9b87f5", "#f1efff"],
  },
] as const;

export const ThemeSwatch = ({ colors }: Pick<ThemeOption, "colors">) => (
  <span className="flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-border shadow-sm" aria-hidden="true">
    {colors.map((color) => (
      <span key={color} className="h-full flex-1" style={{ backgroundColor: color }} />
    ))}
  </span>
);

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const selectedTheme = theme ?? "system";
  const selectedOption = THEME_OPTIONS.find((option) => option.value === selectedTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-[40px] w-[40px] transition-transform hover:scale-105"
          aria-label={`Избери цветова тема. Текуща: ${selectedOption?.label ?? "Автоматична"}`}
          title="Цветова тема"
        >
          {/* The key remounts the drawing on every change, so the new theme's drawing spins in. */}
          <SiteArt key={selectedTheme} name={selectedOption?.art ?? "laptop"} className="theme-art-swap !size-7 drop-shadow-sm" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(21rem,calc(100vw-1rem))] rounded-xl p-2 shadow-xl">
        <DropdownMenuLabel className="flex items-center gap-2 px-2 py-2">
          <Palette className="h-4 w-4 text-primary" aria-hidden="true" />
          Цветова тема
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={selectedTheme} onValueChange={setTheme} className="grid gap-1 sm:grid-cols-2">
          {THEME_OPTIONS.map(({ value, label, description, art, colors }) => (
            <DropdownMenuRadioItem
              key={value}
              value={value}
              className="min-h-[4.25rem] cursor-pointer items-start rounded-lg py-2 pl-7 pr-2 data-[state=checked]:bg-accent"
            >
              <span className="mt-0.5"><ThemeSwatch colors={colors} /></span>
              <span className="ml-2 min-w-0">
                <span className="flex items-center gap-1 text-sm font-semibold">
                  <SiteArt name={art} className="h-4 w-4" />
                  {label}
                </span>
                <span className="block whitespace-normal text-[11px] leading-4 text-muted-foreground">{description}</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
