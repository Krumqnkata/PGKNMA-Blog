import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

const PageLoadStats = () => {
  const [loadTime, setLoadTime] = useState<number | null>(null);

  useEffect(() => {
    const calculateLoadTime = () => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (navigation) {
        const time = navigation.loadEventEnd - navigation.startTime;
        setLoadTime(Math.round(time));
      }
    };

    if (document.readyState === "complete") {
      setTimeout(calculateLoadTime, 0);
    } else {
      window.addEventListener("load", () => setTimeout(calculateLoadTime, 0));
    }
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
