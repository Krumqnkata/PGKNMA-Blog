import { Check, Palette } from "lucide-react";
import { useTheme } from "next-themes";

import { SiteArt } from "@/components/art/SiteArt";
import { THEME_OPTIONS, ThemeSwatch } from "@/components/ThemeSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const ThemeSettingsCard = () => {
  const { theme, setTheme } = useTheme();
  const selectedTheme = theme ?? "system";

  return (
    <Card className="overflow-hidden transition-[box-shadow,border-color] duration-300 hover:border-primary/25 hover:shadow-lg">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary/10 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" aria-hidden="true" />
          Външен вид
        </CardTitle>
        <CardDescription>
          Изберете цветова тема. Промяната се прилага веднага и се запазва на това устройство.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5 sm:pt-6">
        <RadioGroup
          value={selectedTheme}
          onValueChange={setTheme}
          aria-label="Избор на цветова тема"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          {THEME_OPTIONS.map(({ value, label, description, art, colors }) => {
            const selected = value === selectedTheme;
            const inputId = `profile-theme-${value}`;

            return (
              <label
                key={value}
                htmlFor={inputId}
                className="group relative flex min-h-[6.25rem] cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-background/65 p-3.5 transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/45 hover:bg-accent/45 hover:shadow-md has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/[0.07] has-[[data-state=checked]]:shadow-sm"
              >
                <ThemeSwatch colors={colors} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 font-semibold leading-5">
                    <SiteArt name={art} className="h-5 w-5" />
                    {label}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-muted-foreground">{description}</span>
                </span>
                <RadioGroupItem id={inputId} value={value} className="sr-only" />
                <span
                  className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-transparent transition-colors group-has-[[data-state=checked]]:border-primary group-has-[[data-state=checked]]:bg-primary group-has-[[data-state=checked]]:text-primary-foreground"
                  aria-hidden="true"
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="sr-only">{selected ? "Избрана тема" : "Избери тема"}</span>
              </label>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default ThemeSettingsCard;
