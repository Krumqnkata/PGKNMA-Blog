/**
 * Builds site-knowledge.json: every text that exists only in the frontend, for
 * the AI assistant. `npm run build` writes it next to index.html (see the
 * `siteKnowledge` plugin in vite.config.ts) and the backend indexes it.
 *
 * Only relative imports here: this file is also loaded by vite.config.ts.
 */
import { CONTACT, CONTACT_PAGE_INTRO, FOOTER_QUICK_LINKS, FOOTER_RESOURCES, FOOTER_TAGLINE, SOCIAL_LINKS } from "./contact";
import { FAQ_ENTRIES } from "./faq";
import { GAMES_POINTS_TEXT, GAMES_POINTS_TITLE, GAMIFICATION_QUESTIONS } from "./gamification";
import { HOME_BENEFITS, HOME_BENEFITS_TITLE, HOME_FIRST_STEPS, HOME_HERO, HOME_HERO_SIGNALS } from "./home";
import {
  BALKANSKI_CAREER,
  BALKANSKI_CAREER_TITLE,
  BALKANSKI_CHARITY,
  BALKANSKI_CHARITY_TITLE,
  BALKANSKI_INTRO,
  BALKANSKI_TITLE,
} from "./minko-balkanski";
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from "./pages";
import { ALLOWED_RULES, FORBIDDEN_RULES, RULES_CONSEQUENCES, RULES_CONTACT_NOTE, RULES_TITLE } from "./rules";
import { TEAM_INTRO, TEAM_JOIN_TEXT, TEAM_JOIN_TITLE, TEAM_MEMBERS, TEAM_NOTE } from "./team";

export interface KnowledgeSection {
  id: string;
  title: string;
  url: string;
  text: string;
}

export interface SiteKnowledge {
  version: 1;
  generated_at: string;
  sections: KnowledgeSection[];
}

const lines = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join("\n");

function contactSection(): KnowledgeSection {
  const socials = SOCIAL_LINKS.filter((link) => link.label !== "Website")
    .map((link) => `${link.label}: ${link.href}`)
    .join(", ");
  return {
    id: "contact",
    title: "Контакти",
    url: "/contact",
    text: lines(
      "Контакти на ПГКНМА „Проф. Минко Балкански“:",
      `• Адрес: ${CONTACT.address}`,
      `• Телефон: ${CONTACT.phone}`,
      `• Имейл на училището: ${CONTACT.officialEmail}`,
      `• Техническа поддръжка на блога: ${CONTACT.supportEmail}`,
      `• Уебсайт на гимназията: ${CONTACT.schoolWebsite} (приемът е на ${CONTACT.admissionUrl})`,
      `• Социални мрежи: ${socials}`,
      `Съобщение до екипа на блога може да се изпрати и през формата на страницата „Контакти“ (/contact). ${CONTACT_PAGE_INTRO}`,
    ),
  };
}

function pageSections(): KnowledgeSection[] {
  const pages = Object.entries(PAGE_DESCRIPTIONS)
    .filter(([path]) => path !== "/easter-egg")
    .map(([path, description]) => ({
      id: `page${path === "/" ? "-home" : path.replace(/\//g, "-")}`,
      title: `Страница „${PAGE_TITLES[path] ?? path}“`,
      url: path,
      text: `Страница „${PAGE_TITLES[path] ?? path}“ на адрес ${path}: ${description}`,
    }));
  const siteMap = Object.entries(PAGE_TITLES)
    .filter(([path]) => path !== "/easter-egg")
    .map(([path, title]) => `• ${title} — ${path}`)
    .join("\n");
  return [
    ...pages,
    { id: "site-map", title: "Карта на сайта", url: "/", text: `Страниците на ПГКНМА Блог и адресите им:\n${siteMap}` },
  ];
}

export function buildSiteKnowledge(now: Date = new Date()): SiteKnowledge {
  const sections: KnowledgeSection[] = [
    ...FAQ_ENTRIES.map((entry) => ({
      id: entry.id,
      title: entry.question,
      url: "/faq",
      text: `Въпрос: ${entry.question}\nОтговор: ${entry.answer}`,
    })),
    {
      id: "community-rules",
      title: RULES_TITLE,
      url: "/profile",
      text: lines(
        "Позволено:",
        ...ALLOWED_RULES.map((rule) => `• ${rule.title}: ${rule.text}`),
        "Забранено:",
        ...FORBIDDEN_RULES.map((rule) => `• ${rule.title}: ${rule.text}`),
        `Последици от нарушения: ${RULES_CONSEQUENCES}`,
        RULES_CONTACT_NOTE,
        "Правилата се виждат и в профила на потребителя.",
      ),
    },
    contactSection(),
    {
      id: "footer-links",
      title: "Полезни връзки",
      url: "/",
      text: lines(
        `ПГКНМА Блог: ${FOOTER_TAGLINE}`,
        "Бързи връзки: " + FOOTER_QUICK_LINKS.map((link) => `${link.label} (${link.href})`).join(", "),
        "Ресурси: " + FOOTER_RESOURCES.map((link) => `${link.label} (${link.href})`).join(", "),
      ),
    },
    {
      id: "team",
      title: "Екипът на ПГКНМА Блог",
      url: "/developers",
      text: lines(
        TEAM_INTRO,
        ...TEAM_MEMBERS.map((member) => `• ${member.name} — ${member.role} (${member.skills.join(", ")}). GitHub: ${member.github}`),
        `${TEAM_JOIN_TITLE} ${TEAM_JOIN_TEXT} За целта пишете през страницата „Контакти“ (/contact).`,
        TEAM_NOTE,
      ),
    },
    {
      id: "minko-balkanski",
      title: BALKANSKI_TITLE,
      url: "/easter-egg",
      text: lines(
        "Професор Минко Балкански е патронът на училището (ПГКНМА „Проф. Минко Балкански“).",
        BALKANSKI_INTRO,
        `${BALKANSKI_CAREER_TITLE}: ${BALKANSKI_CAREER}`,
        `${BALKANSKI_CHARITY_TITLE}: ${BALKANSKI_CHARITY}`,
      ),
    },
    ...GAMIFICATION_QUESTIONS.map((item, index) => ({
      id: `gamification-${index + 1}`,
      title: item.question,
      url: "/gamification",
      text: `Въпрос: ${item.question}\nОтговор: ${item.answer}`,
    })),
    { id: "games-points", title: GAMES_POINTS_TITLE, url: "/games", text: `${GAMES_POINTS_TITLE} в игрите: ${GAMES_POINTS_TEXT}` },
    {
      id: "home",
      title: "Начална страница",
      url: "/",
      text: lines(
        `${HOME_HERO.eyebrow}. ${HOME_HERO.headlineStart} ${HOME_HERO.headlineEnd}`,
        HOME_HERO.description,
        `Акценти: ${HOME_HERO_SIGNALS.join(", ")}.`,
        `${HOME_BENEFITS_TITLE}`,
        ...HOME_BENEFITS.map((benefit) => `• ${benefit.title}: ${benefit.description} (${benefit.href})`),
        "Първи стъпки за нови потребители: " + HOME_FIRST_STEPS.map((step) => `${step.label} ${step.hint} (${step.to})`).join("; ") + ".",
      ),
    },
    ...pageSections(),
  ];
  return { version: 1, generated_at: now.toISOString(), sections };
}
