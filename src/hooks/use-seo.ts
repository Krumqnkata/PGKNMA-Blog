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
    if (!ogImg && ogImage) {
      ogImg = document.createElement("meta");
      ogImg.setAttribute("property", "og:image");
      document.head.appendChild(ogImg);
      createdOgImg = true;
    }
    const prevOgImg = ogImg?.getAttribute("content") || "";
    if (ogImg && ogImage) {
      ogImg.setAttribute("content", ogImage);
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
    };
  }, [title, description, ogImage, ogType]);
};
