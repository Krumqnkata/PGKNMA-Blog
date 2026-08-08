import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const routeTitles: Record<string, string> = {
  "/": "Начало",
  "/news": "Новини",
  "/events": "Училищен календар",
  "/program": "Учебна програма",
  "/bell-suggest": "Предложи песен за звънеца",
  "/weekly-poll": "Анкета на седмицата",
  "/meme-of-the-week": "Меме на седмицата",
  "/changelog": "История на промените",
  "/profile": "Моят профил",
  "/contact": "Контакти",
  "/privacy-policy": "Политика за поверителност",
  "/terms-of-service": "Условия за ползване",
  "/developers": "Разработчици",
  "/faq": "Често задавани въпроси",
  "/tv": "Информационен екран",
  "/easter-egg": "Пауза за веселба! 🥚",
};

const routeDescriptions: Record<string, string> = {
  "/": "Добре дошли в официалния блог на ПГКНМА. Научете най-новите новини, свързани с гимназията, училищни събития и интересни проекти.",
  "/news": "Разгледайте списъка с всички публикации, новини и съобщения от ПГКНМА.",
  "/events": "Следете училищния календар на ПГКНМА за предстоящи събития, празници, изпити и ваканции.",
  "/program": "Вижте актуалната учебна програма за класовете в ПГКНМА.",
  "/bell-suggest": "Предложете любимите си песни за училищния звънец на ПГКНМА и гласувайте за предложенията на другите.",
  "/weekly-poll": "Участвайте в седмичните ни анкети и споделете мнението си по интересни теми.",
  "/meme-of-the-week": "Разгледайте най-забавните мемета от училищния живот в ПГКНМА и предложете свои.",
  "/changelog": "История на промените, актуализациите и новите функции в блог платформата на ПГКНМА.",
  "/profile": "Управлявайте вашия профил, разглеждайте вашите коментари и предложения в ПГКНМА Блог.",
  "/contact": "Свържете се с екипа на ПГКНМА Блог за въпроси, препоръки и обратна връзка.",
  "/privacy-policy": "Политика за поверителност и защита на личните данни в ПГКНМА Блог.",
  "/terms-of-service": "Общи условия за ползване на уебсайта на ПГКНМА Блог.",
  "/developers": "Запознайте се с екипа от разработчици, създали и поддържащи блог платформата на ПГКНМА.",
  "/faq": "Често задавани въпроси и отговори за работата с блог платформата на ПГКНМА.",
  "/tv": "Информационен екран за излъчване на съобщения и новини в реално време в сградата на ПГКНМА.",
};

const SEOManager = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    // For dynamic paths like /post/:id, we don't set static titles here.
    // The individual Post component will use the useSEO hook to set the title dynamically.
    if (path.startsWith("/post/")) {
      return;
    }

    const title = routeTitles[path] || "Блог";
    const description = routeDescriptions[path] || "Интересни новини и съобщения от училищния живот.";

    const fullTitle = `${title} | ПГКНМА Блог`;
    const canonicalUrl = new URL(`${location.pathname}${location.search}`, window.location.origin).toString();
    const defaultImage = new URL("/social-preview.jpg", window.location.origin).toString();
    document.title = fullTitle;

    // Notify visibility change script in index.html
    const customWindow = window as Window & { __setPageTitle?: (title: string) => void };
    if (customWindow.__setPageTitle) {
      customWindow.__setPageTitle(fullTitle);
    }

    // Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", description);

    // Update OpenGraph Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", fullTitle);

    // Update OpenGraph Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement("meta");
      ogDesc.setAttribute("property", "og:description");
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute("content", description);

    // Reset OpenGraph Image to default if it's not a post page
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) {
      ogImg.setAttribute("content", defaultImage);
    }

    document.querySelector('meta[property="og:image:secure_url"]')?.setAttribute("content", defaultImage);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", canonicalUrl);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", fullTitle);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", description);
    document.querySelector('meta[name="twitter:image"]')?.setAttribute("content", defaultImage);
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", canonicalUrl);
  }, [location]);

  return null;
};

export default SEOManager;
