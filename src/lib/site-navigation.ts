import { CalendarDays, CalendarRange, ChartNoAxesColumn, Gamepad2, HelpCircle, Home, Images, Mail, Music2, Newspaper, Smile, Trophy } from "lucide-react";

export const siteNavLinks = [
  { name: "Начало", path: "/", icon: Home, minWidth: 0 },
  { name: "Новини", path: "/news", icon: Newspaper, minWidth: 0 },
  { name: "Събития", path: "/events", icon: CalendarDays, minWidth: 0 },
  { name: "Програма", path: "/program", icon: CalendarRange, minWidth: 0 },
  { name: "Предложения за звънец", path: "/bell-suggest", icon: Music2, minWidth: 768 },
  { name: "Седмична анкета", path: "/weekly-poll", icon: ChartNoAxesColumn, minWidth: 768 },
  { name: "Меме на седмицата", path: "/meme-of-the-week", icon: Smile, minWidth: 1280 },
] as const;

export const additionalNavLinks = [
  { name: "Игри", path: "/games", icon: Gamepad2 },
  { name: "Мисии и награди", path: "/gamification", icon: Trophy },
  { name: "Галерия", path: "/gallery", icon: Images },
  { name: "Помощ и въпроси", path: "/faq", icon: HelpCircle },
  { name: "Контакт", path: "/contact", icon: Mail },
] as const;
