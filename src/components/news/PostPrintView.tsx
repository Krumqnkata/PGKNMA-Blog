import { forwardRef } from "react";
import { createPortal } from "react-dom";

import MarkdownRenderer from "@/components/MarkdownRenderer";
import type { Post } from "@/lib/api";
import { formatSiteDate } from "@/lib/date-time";
import { getPostShareUrl } from "@/lib/share";

const PRINT_MARKDOWN_CLASS = "prose max-w-none break-words prose-img:max-w-full prose-a:text-primary prose-strong:font-semibold prose-em:italic";

const safelyDecode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

interface PostPrintViewProps {
  post: Post;
}

/**
 * Printable copy of an article. It is a direct child of <body> so that, in print,
 * everything else on the page can be hidden with a single rule (see index.css).
 */
export const PostPrintView = forwardRef<HTMLDivElement, PostPrintViewProps>(({ post }, ref) => {
  const shareUrl = getPostShareUrl(post.id);
  const categories = post.categories.map((category) => category.full_name).join(" · ");

  return createPortal(
    <div ref={ref} className="post-print-view">
      <header className="post-print-masthead">
        <img src="/logo-light.png" alt="" />
        <span>ПГКНМА Блог</span>
      </header>

      <article>
        {categories && <p className="post-print-categories">{categories}</p>}
        <h1 className="post-print-title">{post.title}</h1>
        {post.hook && <p className="post-print-hook font-reading">{post.hook}</p>}
        <p className="post-print-meta">
          {post.author_username && <span>{post.author_username} · </span>}
          <time dateTime={post.published_at || post.created_at}>{formatSiteDate(post.published_at || post.created_at)}</time>
        </p>

        {post.banner && <img className="post-print-banner" src={post.banner} alt={`Банер за ${post.title}`} />}

        <div className="post-print-body font-reading">
          <MarkdownRenderer content={post.content} className={PRINT_MARKDOWN_CLASS} imageLoading="eager" />
        </div>

        {post.gallery?.length > 0 && (
          <section className="post-print-section">
            <h2>Галерия</h2>
            <div className="post-print-gallery">
              {post.gallery.map((image, index) => (
                <figure key={image.id} data-featured={image.is_featured || undefined}>
                  <img
                    src={image.display_url || image.image_url}
                    alt={image.alt_text || image.title || `Снимка ${index + 1} към ${post.title}`}
                  />
                  {image.title && <figcaption>{image.title}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        )}

        {post.documents?.length > 0 && (
          <section className="post-print-section">
            <h2>Прикачени файлове</h2>
            <ul className="post-print-documents">
              {post.documents.map((document, index) => (
                <li key={document.id || index}>
                  <strong>{safelyDecode(document.file_url.split("/").pop() || "")}</strong>
                  <span>{safelyDecode(new URL(document.file_url, window.location.origin).href)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      <footer className="post-print-footer">
        <span>Източник: {shareUrl}</span>
        <span>Отпечатано на {formatSiteDate(new Date().toISOString())}</span>
      </footer>
    </div>,
    document.body,
  );
});

PostPrintView.displayName = "PostPrintView";
