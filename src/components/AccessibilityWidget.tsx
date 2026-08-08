import {
  Accessibility,
  Blend,
  BookOpen,
  Contrast,
  Eye,
  Focus,
  Link2,
  Minus,
  MousePointer2,
  Pause,
  Plus,
  RotateCcw,
  ScanLine,
  Type,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAccessibility } from "@/hooks/use-accessibility";
import type { ColorVisionMode } from "@/contexts/accessibility-context";

export default function AccessibilityWidget() {
  const accessibility = useAccessibility();
  const hasCustomSettings = accessibility.fontScale !== 100
    || accessibility.highContrast
    || accessibility.monochrome
    || accessibility.reduceMotion
    || accessibility.dyslexiaFont
    || accessibility.highlightLinks
    || accessibility.enhancedFocus
    || accessibility.readingGuide
    || accessibility.largeCursor
    || accessibility.colorVisionMode !== "none";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Отвори настройки за достъпност" className="relative h-[40px] w-[40px] text-white hover:bg-white/10 hover:text-white">
          <Accessibility className="h-5 w-5" aria-hidden="true" />
          {hasCustomSettings && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-[#0a2e2e]" aria-hidden="true" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="max-h-[min(80vh,44rem)] w-[min(23rem,calc(100vw-1rem))] overflow-y-auto p-0">
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
          <Separator />
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Четливост</p>
            <Button type="button" variant={accessibility.dyslexiaFont ? "default" : "outline"} className="w-full justify-start" aria-pressed={accessibility.dyslexiaFont} onClick={accessibility.toggleDyslexiaFont}><BookOpen className="h-4 w-4" />Шрифт за дислексия</Button>
            <Button type="button" variant={accessibility.highlightLinks ? "default" : "outline"} className="w-full justify-start" aria-pressed={accessibility.highlightLinks} onClick={accessibility.toggleHighlightLinks}><Link2 className="h-4 w-4" />Подчертаване на линковете</Button>
            <Button type="button" variant={accessibility.enhancedFocus ? "default" : "outline"} className="w-full justify-start" aria-pressed={accessibility.enhancedFocus} onClick={accessibility.toggleEnhancedFocus}><Focus className="h-4 w-4" />Ярък фокус</Button>
          </div>
          <Separator />
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Помощници за четене</p>
            <Button type="button" variant={accessibility.readingGuide ? "default" : "outline"} className="w-full justify-start" aria-pressed={accessibility.readingGuide} onClick={accessibility.toggleReadingGuide}><ScanLine className="h-4 w-4" />Водач за четене</Button>
            <Button type="button" variant={accessibility.largeCursor ? "default" : "outline"} className="w-full justify-start" aria-pressed={accessibility.largeCursor} onClick={accessibility.toggleLargeCursor}><MousePointer2 className="h-4 w-4" />Уголемен курсор</Button>
          </div>
          <Separator />
          <div className="space-y-2">
            <label htmlFor="accessibility-color-vision" className="flex items-center gap-2 text-sm font-medium"><Eye className="h-4 w-4" />Цветно зрение</label>
            <Select value={accessibility.colorVisionMode} onValueChange={(value) => accessibility.setColorVisionMode(value as ColorVisionMode)}>
              <SelectTrigger id="accessibility-color-vision" aria-label="Режим за цветна слепота" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без филтър</SelectItem>
                <SelectItem value="protanopia">Протанопия</SelectItem>
                <SelectItem value="deuteranopia">Деутеранопия</SelectItem>
                <SelectItem value="tritanopia">Тританопия</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="button" variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={accessibility.resetAll}><RotateCcw className="h-4 w-4" />Възстанови всички настройки</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
