import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

const PageLoadStats = () => {
  const [loadTime, setLoadTime] = useState<number | null>(null);

  useEffect(() => {
    let timeoutId: number | undefined;
    const calculateLoadTime = () => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (navigation) {
        const time = navigation.loadEventEnd - navigation.startTime;
        setLoadTime(Math.round(time));
      }
    };
    const scheduleCalculation = () => {
      timeoutId = window.setTimeout(calculateLoadTime, 0);
    };

    if (document.readyState === "complete") {
      scheduleCalculation();
    } else {
      window.addEventListener("load", scheduleCalculation, { once: true });
    }

    return () => {
      window.removeEventListener("load", scheduleCalculation);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  if (loadTime === null) return null;

  return (
    <div className="flex items-center justify-center gap-2 text-xs text-foreground">
      <Zap className="h-3 w-3" />
      <span>Страницата зареди за {loadTime}ms</span>
    </div>
  );
};

export default PageLoadStats;
