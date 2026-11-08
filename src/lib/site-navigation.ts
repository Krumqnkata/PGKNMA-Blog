import { CalendarDays, CalendarRange, ChartNoAxesColumn, Gamepad2, HelpCircle, Home, Images, Mail, Music2, Newspaper, Smile, Trophy } from "lucide-react";

// `bottomNav` links stay visible in the mobile bottom bar, `header` links in the desktop header.
// Everything else is grouped under "Още" in both places.
export const siteNavLinks = [
  { name: "Начало", path: "/", icon: Home, art: "house", bottomNav: true, header: false },
  { name: "Новини", path: "/news", icon: Newspaper, art: "newspaper", bottomNav: true, header: true },
  { name: "Събития", path: "/events", icon: CalendarDays, art: "calendar", bottomNav: true, header: true },
  { name: "Програма", path: "/program", icon: CalendarRange, art: "schedule", bottomNav: true, header: true },
  { name: "Галерия", path: "/gallery", icon: Images, art: "photos", bottomNav: false, header: true },
  { name: "Предложения за звънец", path: "/bell-suggest", icon: Music2, art: "bell", bottomNav: false, header: false },
  { name: "Седмична анкета", path: "/weekly-poll", icon: ChartNoAxesColumn, art: "poll", bottomNav: false, header: false },
  { name: "Меме на седмицата", path: "/meme-of-the-week", icon: Smile, art: "meme", bottomNav: false, header: false },
  { name: "Игри", path: "/games", icon: Gamepad2, art: "gamepad", bottomNav: false, header: false },
  { name: "Мисии и награди", path: "/gamification", icon: Trophy, art: "trophy", bottomNav: false, header: false },
  { name: "Помощ и въпроси", path: "/faq", icon: HelpCircle, art: "help", bottomNav: false, header: false },
  { name: "Контакт", path: "/contact", icon: Mail, art: "envelope", bottomNav: false, header: false },
] as const;

export type SiteNavLink = (typeof siteNavLinks)[number];

export const isNavLinkActive = (path: string, pathname: string) => {
  if (path === "/") return pathname === "/";
  if (path === "/news" && pathname.startsWith("/post/")) return true;
  return pathname === path || pathname.startsWith(`${path}/`);
};
