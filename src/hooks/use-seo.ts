import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
}

export const useSEO = ({ title, description, ogImage, ogType = "website" }: SEOProps) => {
  useEffect(() => {
    // Save original title
    const prevTitle = document.title;
    
    // Set Title (add site name suffix if not present)
    const fullTitle = title.includes("ПГКНМА") ? title : `${title} | ПГКНМА Блог`;
    const canonicalUrl = new URL(window.location.pathname, window.location.origin).toString();
    const absoluteImage = new URL(ogImage || "/social-preview.jpg", window.location.origin).toString();
    document.title = fullTitle;
    
    // Update global titles array used by index.html script if present
    const customWindow = window as Window & { __setPageTitle?: (title: string) => void };
    if (customWindow.__setPageTitle) {
      customWindow.__setPageTitle(fullTitle);
    }

    // Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    let createdDesc = false;
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
      createdDesc = true;
    }
    const prevDesc = metaDescription.getAttribute("content") || "";
    if (description) {
      metaDescription.setAttribute("content", description);
    }

    // Update OpenGraph Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    let createdOgTitle = false;
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
      createdOgTitle = true;
    }
    const prevOgTitle = ogTitle.getAttribute("content") || "";
    ogTitle.setAttribute("content", fullTitle);

    // Update OpenGraph Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    let createdOgDesc = false;
    if (!ogDesc) {
      ogDesc = document.createElement("meta");
      ogDesc.setAttribute("property", "og:description");
      document.head.appendChild(ogDesc);
      createdOgDesc = true;
    }
    const prevOgDesc = ogDesc.getAttribute("content") || "";
    if (description) {
      ogDesc.setAttribute("content", description);
    }

    // Update OpenGraph Image
    let ogImg = document.querySelector('meta[property="og:image"]');
    let createdOgImg = false;
    if (!ogImg) {
      ogImg = document.createElement("meta");
      ogImg.setAttribute("property", "og:image");
      document.head.appendChild(ogImg);
      createdOgImg = true;
    }
    const prevOgImg = ogImg?.getAttribute("content") || "";
    if (ogImg) {
      ogImg.setAttribute("content", absoluteImage);
    }

    // Update OpenGraph Type
    let ogTypeMeta = document.querySelector('meta[property="og:type"]');
    let createdOgType = false;
    if (!ogTypeMeta) {
      ogTypeMeta = document.createElement("meta");
      ogTypeMeta.setAttribute("property", "og:type");
      document.head.appendChild(ogTypeMeta);
      createdOgType = true;
    }
    const prevOgType = ogTypeMeta.getAttribute("content") || "";
    ogTypeMeta.setAttribute("content", ogType);

    const managedAttributes: Array<[string, string, string]> = [
      ["property", "og:url", canonicalUrl],
      ["property", "og:image:secure_url", absoluteImage],
      ["name", "twitter:card", "summary_large_image"],
      ["name", "twitter:title", fullTitle],
      ["name", "twitter:description", description || "Новини и събития от ПГКНМА."],
      ["name", "twitter:image", absoluteImage],
    ];
    const managedMeta = managedAttributes.map(([attribute, key, content]) => {
      let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      const created = !element;
      const previous = element?.getAttribute("content") || "";
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
      return { element, created, previous };
    });

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const createdCanonical = !canonical;
    const previousCanonical = canonical?.getAttribute("href") || "";
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    // Cleanup/Restore on unmount
    return () => {
      document.title = prevTitle;
      const customWindow = window as Window & { __setPageTitle?: (title: string) => void };
      if (customWindow.__setPageTitle) {
        customWindow.__setPageTitle(prevTitle);
      }
      
      if (metaDescription) {
        if (createdDesc) {
          document.head.removeChild(metaDescription);
        } else {
          metaDescription.setAttribute("content", prevDesc);
        }
      }
      
      if (ogTitle) {
        if (createdOgTitle) {
          document.head.removeChild(ogTitle);
        } else {
          ogTitle.setAttribute("content", prevOgTitle);
        }
      }
      
      if (ogDesc) {
        if (createdOgDesc) {
          document.head.removeChild(ogDesc);
        } else {
          ogDesc.setAttribute("content", prevOgDesc);
        }
      }
      
      if (ogImg) {
        if (createdOgImg) {
          document.head.removeChild(ogImg);
        } else {
          ogImg.setAttribute("content", prevOgImg);
        }
      }
      
      if (ogTypeMeta) {
        if (createdOgType) {
          document.head.removeChild(ogTypeMeta);
        } else {
          ogTypeMeta.setAttribute("content", prevOgType);
        }
      }

      managedMeta.forEach(({ element, created, previous }) => {
        if (created) element.remove();
        else element.setAttribute("content", previous);
      });
      if (canonical) {
        if (createdCanonical) canonical.remove();
        else canonical.setAttribute("href", previousCanonical);
      }
    };
  }, [title, description, ogImage, ogType]);
};
