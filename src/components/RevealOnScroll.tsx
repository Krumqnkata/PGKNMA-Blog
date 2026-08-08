import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
}

export default function RevealOnScroll({ children, className = "" }: RevealOnScrollProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setVisible(true);
      observer.disconnect();
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={elementRef} data-visible={visible} className={`home-scroll-reveal ${className}`}>{children}</div>;
}
