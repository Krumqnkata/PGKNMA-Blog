/** Контакти и външни връзки. Показват се на /contact и във footer-а и влизат в знанията на ИИ асистента. */
export const CONTACT = {
  address: "гр. Стара Загора, ул. „Стефан Сливков“ №7",
  phone: "+359 88 499 4500",
  phoneHref: "tel:+359884994500",
  officialEmail: "info-2400020@edu.mon.bg",
  supportEmail: "support@pgknma.space",
  schoolWebsite: "https://pgknma.com/",
  admissionUrl: "https://pgknma.com/priem",
} as const;

export const CONTACT_PAGE_INTRO = "Въпрос, идея или технически проблем — изпратете ни съобщение или използвайте директните контакти.";

export const FOOTER_TAGLINE = "Овластяване на учениците и активно партньорство с родителите чрез иновации и споделени ценности.";

export interface SiteLink {
  label: string;
  href: string;
}

export const FOOTER_QUICK_LINKS: SiteLink[] = [
  { label: "Мисии и награди", href: "/gamification" },
  { label: "Контакт", href: "/contact" },
  { label: "Прием", href: CONTACT.admissionUrl },
  { label: "Новини", href: "/news" },
];

export const FOOTER_RESOURCES: SiteLink[] = [
  { label: "Сайт на гимназията", href: CONTACT.schoolWebsite },
  { label: "Често задавани въпроси", href: "/faq" },
  { label: "Политика за поверителност", href: "/privacy-policy" },
  { label: "Условия за ползване", href: "/terms-of-service" },
  { label: "История на промени", href: "/changelog" },
];

export const SOCIAL_LINKS: SiteLink[] = [
  { label: "Facebook", href: "https://facebook.com/pgknma" },
  { label: "TikTok", href: "https://www.tiktok.com/@pgknma.proffbalkanski" },
  { label: "Instagram", href: "https://www.instagram.com/pgknma.prof.minko.balkanski/" },
  { label: "YouTube", href: "https://www.youtube.com/@pgknma" },
  { label: "Website", href: CONTACT.schoolWebsite },
];
