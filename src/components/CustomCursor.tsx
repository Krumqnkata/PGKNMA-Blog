import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

const CustomCursor: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkDevice = () => {
      // Проверяваме дали устройството има мишка (pointer: fine)
      // Ако НЯМА мишка ИЛИ екрана е под 768px, го броим за мобилно
      const hasMouse = window.matchMedia('(pointer: fine)').matches;
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(!hasMouse || isSmallScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    const onMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      if (!isVisible) setIsVisible(true);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, a, [role='button'], .cursor-pointer")) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    if (!isMobile) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseover", onMouseOver);
      document.addEventListener("mouseleave", onMouseLeave);
      document.addEventListener("mouseenter", onMouseEnter);
    }

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, [isVisible, isMobile]);

  if (isMobile) return null;

  return (
    <>
      <style>{`
        /* Скриваме истинския курсор само на устройства с мишка */
        @media (pointer: fine) {
          html, body, a, button, input, textarea, [role="button"], .cursor-pointer {
            cursor: none !important;
          }
        }
      `}</style>
      
      <div
        ref={cursorRef}
        className={cn(
          "accessibility-custom-cursor fixed top-0 left-0 pointer-events-none z-[99999] transition-opacity duration-300 ease-in-out",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        style={{ left: 0, top: 0 }}
      >
        <div
          className={cn(
            "accessibility-custom-cursor-ring relative -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary transition-all duration-300 ease-out",
            isHovering 
              ? "w-12 h-12 bg-primary/10 border-primary/40 scale-125 shadow-[0_0_20px_rgba(var(--primary),0.2)]" 
              : "w-6 h-6 bg-transparent border-primary/60"
          )}
        >
          <div className="accessibility-custom-cursor-dot absolute top-1/2 left-1/2 w-1 h-1 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    </>
  );
};

export default CustomCursor;
