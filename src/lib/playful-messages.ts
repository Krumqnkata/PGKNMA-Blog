/**
 * Light school jokes for the moments when something ends or goes wrong.
 * They only sit next to the real information, such as the reason for an error or the points won.
 */
export const ERROR_JOKES = [
  "Моливът се счупи по средата на изречението.",
  "Някой изтри дъската твърде рано.",
  "Сайтът излезе до тоалетната. Връща се веднага.",
  "Тази част днес отговаря с „не съм учил“.",
  "Страницата си забрави домашното вкъщи.",
] as const;

export const GAME_LINES = {
  won: [
    "Учителят би ти писал шестица.",
    "Дори звънецът спря, за да ти ръкопляска.",
    "Това отива право в дневника. В добрата част.",
    "Мозъкът ти заслужава голямо междучасие.",
  ],
  lost: [
    "Не е двойка, а повод за реванш.",
    "И най-добрите си забравят тетрадката понякога.",
    "Поправителният е само на един клик разстояние.",
    "Следващия път задачата няма да е толкова късметлийка.",
  ],
  expired: [
    "Звънецът би, преди да довършиш.",
    "Задачата излезе в междучасие и не се върна.",
    "Времето свърши. Моливите на масата.",
  ],
} as const;

export const POLL_LINES = {
  correct: [
    "Ако имаше дневник за анкети, там щеше да има шестица.",
    "Класът току-що те погледна с уважение.",
    "Верен отговор и нито едно надничане в тетрадката.",
  ],
  wrong: [
    "Почти. Следващата седмица задачата е твоя.",
    "Грешките са просто домашно за следващия път.",
    "Дори учителите понякога проверяват отговорите отзад.",
  ],
} as const;

export interface Greeting {
  text: string;
  art: "sun" | "moon";
}

/** A greeting for the visitor's local hour (0–23). Night owls get a wink instead of "good night". */
export const greetingFor = (hour: number): Greeting => {
  if (hour >= 5 && hour < 11) return { text: "Добро утро", art: "sun" };
  if (hour >= 11 && hour < 18) return { text: "Добър ден", art: "sun" };
  if (hour >= 18 && hour < 22) return { text: "Добър вечер", art: "moon" };
  return { text: "Още будуваш", art: "moon" };
};

export const pickRandom = <T,>(items: readonly T[]): T => (
  items[Math.floor(Math.random() * items.length)]
);
