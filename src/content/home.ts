/** Описателните текстове на началната страница. Влизат и в знанията на ИИ асистента. */
export const HOME_HERO = {
  eyebrow: "Официалният дигитален портал на ПГКНМА",
  headlineStart: "Не просто следвай училищния живот.",
  headlineEnd: "Бъди част от него.",
  description: "Новини, събития и възможности от ПГКНМА — поднесени ясно, навреме и на едно място.",
};

export const HOME_HERO_SIGNALS = [
  "Актуални новини",
  "Важни дати",
  "Гласът на общността",
];

export const HOME_BENEFITS_EYEBROW = "Създадено за твоя ден";
export const HOME_BENEFITS_TITLE = "Един портал. Три начина да си една крачка напред.";

export interface HomeBenefit {
  title: string;
  description: string;
  href: string;
  action: string;
  art: string;
  accent: string;
}

export const HOME_BENEFITS: HomeBenefit[] = [
  {
    title: "Важното, веднага",
    description: "Официални новини, успехи и възможности — подредени ясно, без да губиш време в търсене.",
    href: "/news",
    action: "Отвори новините",
    art: "newspaper",
    accent: "from-sky-500/25 via-cyan-500/10 to-transparent",
  },
  {
    title: "Планирай с увереност",
    description: "Виж предстоящите събития и важните дати навреме, за да знаеш какво следва.",
    href: "/events",
    action: "Виж календара",
    art: "calendar",
    accent: "from-violet-500/25 via-fuchsia-500/10 to-transparent",
  },
  {
    title: "Участвай, не само чети",
    description: "Гласувай, предлагай идеи и бъди активна част от решенията и настроението в училище.",
    href: "/weekly-poll",
    action: "Включи се сега",
    art: "poll",
    accent: "from-amber-500/25 via-orange-500/10 to-transparent",
  },
];

export interface HomeFirstStep {
  to: string;
  label: string;
  hint: string;
  art: string;
}

export const HOME_FIRST_STEPS: HomeFirstStep[] = [
  { to: "/bell-suggest", label: "Предложи песен", hint: "за училищния звънец", art: "bell" },
  { to: "/games", label: "Изиграй игра", hint: "и събери първите си точки", art: "gamepad" },
  { to: "/weekly-poll", label: "Реши задачата на седмицата", hint: "и сравни се с другите", art: "poll" },
];
