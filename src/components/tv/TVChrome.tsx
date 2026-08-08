import { useEffect, useState } from "react";
import { Clock, Instagram } from "lucide-react";

const BACKGROUND_CHANGE_DURATION = 8_000;
const LANDSCAPE_IMAGES = Array.from({ length: 50 }, (_, index) => `/Landscape/${index + 1}.jpg`);
const DAYS_OF_WEEK = ["Неделя", "Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота"];

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export function TVBackground() {
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setImageIndex((currentIndex) => {
        let nextIndex = currentIndex;
        while (nextIndex === currentIndex) {
          nextIndex = Math.floor(Math.random() * LANDSCAPE_IMAGES.length);
        }
        return nextIndex;
      });
    }, BACKGROUND_CHANGE_DURATION);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-gray-900">
      <img
        key={LANDSCAPE_IMAGES[imageIndex]}
        src={LANDSCAPE_IMAGES[imageIndex]}
        alt=""
        className="h-full w-full animate-in object-cover fade-in duration-1000"
      />
      <div className="absolute inset-0 bg-gray-900/70" />
    </div>
  );
}

export function TVScreenHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-gray-800 bg-gray-900/30 px-3 py-3 shadow-lg backdrop-blur-sm md:h-24 md:p-4">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center gap-3 md:px-4">
        <img src="/logo-dark.png" alt="Лого на ПГКНМА" className="h-12 w-auto object-contain md:h-16" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-blue-400 drop-shadow md:text-3xl">TV Екран на ПГКНМА Блог</h1>
          <p className="hidden text-lg text-gray-300 md:block">Най-популярното съдържание и резултати от анкетите</p>
        </div>
        <a href="https://pgknma.space" target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm text-blue-300 underline hover:text-blue-200 md:text-lg">pgknma.space</a>
      </div>
    </header>
  );
}

export function TVScreenFooter() {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString("bg-BG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 h-14 border-t border-gray-800 bg-gray-900/30 px-3 py-3 text-xs text-gray-400 shadow-lg backdrop-blur-sm md:h-16 md:p-4 md:text-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 md:px-4">
        <div className="flex min-w-0 items-center gap-4">
          <p className="hidden lg:block">&copy; {currentTime.getFullYear()} ПГКНМА Блог</p>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Clock className="h-4 w-4" />
            <span>{DAYS_OF_WEEK[currentTime.getDay()]}, {formattedTime}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <span className="hidden text-gray-500 md:inline">Последвайте ни:</span>
          <a href="https://www.instagram.com/pgknma.prof.minko.balkanski" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500" aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
          <a href="https://www.tiktok.com/@pgknma.proffbalkanski" target="_blank" rel="noopener noreferrer" className="hover:text-white" aria-label="TikTok"><TikTokIcon className="h-5 w-5" /></a>
        </div>
      </div>
    </footer>
  );
}
