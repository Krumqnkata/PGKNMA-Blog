import {
  GraduationCap,
  MonitorCog,
  Moon,
  Palette,
  Sparkles,
  Sun,
  Trees,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
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
  icon: LucideIcon;
  colors: readonly [string, string, string];
};

export const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    value: "system",
    label: "Автоматична",
    description: "Следва устройството",
    icon: MonitorCog,
    colors: ["#f8fafc", "#64748b", "#0f172a"],
  },
  {
    value: "light",
    label: "Светла",
    description: "Чиста и светла",
    icon: Sun,
    colors: ["#f1f8f8", "#14b8a6", "#123838"],
  },
  {
    value: "dark",
    label: "Тъмна",
    description: "Класическа тъмна",
    icon: Moon,
    colors: ["#0d2626", "#2dd4bf", "#ecfdfb"],
  },
  {
    value: "school",
    label: "Училищна",
    description: "Тюркоаз и златисто",
    icon: GraduationCap,
    colors: ["#fbf8ef", "#0f8f83", "#e6ad24"],
  },
  {
    value: "ocean",
    label: "Океан",
    description: "Дълбоко синьо и циан",
    icon: Waves,
    colors: ["#0d1b31", "#22d3ee", "#dff8ff"],
  },
  {
    value: "forest",
    label: "Горска",
    description: "Спокойни зелени тонове",
    icon: Trees,
    colors: ["#f2f7ed", "#2f855a", "#183a2a"],
  },
  {
    value: "midnight",
    label: "Полунощ",
    description: "Мастилено и виолетово",
    icon: Sparkles,
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
          <Palette className="h-5 w-5" aria-hidden="true" />
          <span
            className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full border border-white/80 bg-primary shadow-sm"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(19rem,calc(100vw-1rem))] rounded-xl p-2 shadow-xl">
        <DropdownMenuLabel className="flex items-center gap-2 px-2 py-2">
          <Palette className="h-4 w-4 text-primary" aria-hidden="true" />
          Цветова тема
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={selectedTheme} onValueChange={setTheme} className="grid gap-1 sm:grid-cols-2">
          {THEME_OPTIONS.map(({ value, label, description, icon: Icon, colors }) => (
            <DropdownMenuRadioItem
              key={value}
              value={value}
              className="min-h-[4.25rem] cursor-pointer items-start rounded-lg py-2 pl-7 pr-2 data-[state=checked]:bg-accent"
            >
              <span className="mt-0.5"><ThemeSwatch colors={colors} /></span>
              <span className="ml-2 min-w-0">
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
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
