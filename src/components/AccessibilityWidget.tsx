import { Accessibility, Blend, Contrast, Minus, Pause, Plus, RotateCcw, Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAccessibility } from "@/hooks/use-accessibility";

export default function AccessibilityWidget() {
  const accessibility = useAccessibility();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Отвори настройки за достъпност" className="relative h-[40px] w-[40px] text-white hover:bg-white/10 hover:text-white">
          <Accessibility className="h-5 w-5" aria-hidden="true" />
          {(accessibility.fontScale !== 100 || accessibility.highContrast || accessibility.monochrome || accessibility.reduceMotion) && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-[#0a2e2e]" aria-hidden="true" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-[min(22rem,calc(100vw-1rem))] p-0">
        <div className="border-b bg-primary/5 p-4">
          <h2 className="flex items-center gap-2 font-semibold"><Accessibility className="h-5 w-5 text-primary" />Достъпност</h2>
          <p className="mt-1 text-sm text-muted-foreground">Настройте изгледа според вашите нужди.</p>
        </div>
        <div className="space-y-4 p-4">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-medium"><Type className="h-4 w-4" />Размер на текста</span>
              <span className="text-sm tabular-nums text-muted-foreground" aria-live="polite">{accessibility.fontScale}%</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={accessibility.decreaseFont} disabled={accessibility.fontScale === 90} aria-label="Намали размера на текста"><Minus className="h-4 w-4" />A</Button>
              <Button variant="outline" size="sm" onClick={accessibility.resetFont}>100%</Button>
              <Button variant="outline" size="sm" onClick={accessibility.increaseFont} disabled={accessibility.fontScale === 120} aria-label="Увеличи размера на текста"><Plus className="h-4 w-4" />A</Button>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Button type="button" variant={accessibility.highContrast ? "default" : "outline"} className="w-full justify-start" aria-pressed={accessibility.highContrast} onClick={accessibility.toggleHighContrast}><Contrast className="h-4 w-4" />Висок контраст</Button>
            <Button type="button" variant={accessibility.monochrome ? "default" : "outline"} className="w-full justify-start" aria-pressed={accessibility.monochrome} onClick={accessibility.toggleMonochrome}><Blend className="h-4 w-4" />Монохромен режим</Button>
            <Button type="button" variant={accessibility.reduceMotion ? "default" : "outline"} className="w-full justify-start" aria-pressed={accessibility.reduceMotion} onClick={accessibility.toggleReduceMotion}><Pause className="h-4 w-4" />Спиране на анимациите</Button>
          </div>
          <Button type="button" variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={accessibility.resetAll}><RotateCcw className="h-4 w-4" />Възстанови всички настройки</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
