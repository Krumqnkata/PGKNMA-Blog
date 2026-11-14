import { PAGE_TITLES } from "@/content/pages";

// Titles live in src/content/pages.ts (also used by the AI assistant).
export const routeTitles: Record<string, string> = PAGE_TITLES;

// What each page fetches once its code is downloaded, phrased to follow "Зареждане на …".
const routeContent: Record<string, string> = {
  "/": "последните новини и събития",
  "/news": "публикациите",
  "/gallery": "албумите",
  "/events": "училищния календар",
  "/program": "учебната програма",
  "/bell-suggest": "песните за звънеца",
  "/weekly-poll": "седмичната анкета",
  "/meme-of-the-week": "мемето на седмицата",
  "/changelog": "историята на промените",
  "/profile": "вашия профил",
  "/privacy-policy": "политиката за поверителност",
  "/terms-of-service": "условията за ползване",
  "/gamification": "мисиите и наградите",
  "/games": "игрите",
  "/tv": "информацията за екрана",
};

const dynamicRoutes: { prefix: string; title: string; content: string }[] = [
  { prefix: "/post/", title: "Публикация", content: "публикацията и коментарите" },
  { prefix: "/gallery/", title: "Албум", content: "снимките от албума" },
  { prefix: "/users/", title: "Профил", content: "публичния профил" },
  { prefix: "/games/", title: "Игри", content: "играта" },
  { prefix: "/notification/", title: "Известие", content: "известието" },
];

export interface RouteLoadingInfo {
  /** Human-readable page name, e.g. "Новини". */
  title: string;
  /** What the page loads after its code arrives, e.g. "публикациите"; null for static pages. */
  content: string | null;
}

export const getRouteLoadingInfo = (pathname: string): RouteLoadingInfo => {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const dynamic = dynamicRoutes.find(({ prefix }) => path.startsWith(prefix));
  if (dynamic) return { title: dynamic.title, content: dynamic.content };
  return { title: routeTitles[path] ?? "Страница", content: routeContent[path] ?? null };
};
