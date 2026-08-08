import { useEffect, useRef } from "react";

import { useAccessibility } from "@/hooks/use-accessibility";

export default function ReadingGuide() {
  const { readingGuide } = useAccessibility();
  const guideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!readingGuide) return;

    let animationFrame = 0;
    const moveGuide = (event: MouseEvent) => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        if (!guideRef.current) return;
        guideRef.current.style.setProperty("--reading-guide-y", `${event.clientY}px`);
        guideRef.current.dataset.visible = "true";
      });
    };
    const hideGuide = () => {
      if (guideRef.current) guideRef.current.dataset.visible = "false";
    };

    window.addEventListener("mousemove", moveGuide, { passive: true });
    document.documentElement.addEventListener("mouseleave", hideGuide);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("mousemove", moveGuide);
      document.documentElement.removeEventListener("mouseleave", hideGuide);
    };
  }, [readingGuide]);

  if (!readingGuide) return null;

  return <div ref={guideRef} className="accessibility-reading-guide" data-visible="false" aria-hidden="true" />;
}
