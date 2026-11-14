import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { routeTitles } from "@/lib/route-labels";
import { PAGE_DESCRIPTIONS } from "@/content/pages";

// Descriptions live in src/content/pages.ts (also used by the AI assistant).
const routeDescriptions: Record<string, string> = PAGE_DESCRIPTIONS;

const SEOManager = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    // For dynamic paths like /post/:id, we don't set static titles here.
    // The individual Post component will use the useSEO hook to set the title dynamically.
    if (path.startsWith("/post/") || path.startsWith("/users/") || path.startsWith("/gallery/") || path.startsWith("/games")) {
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
