import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import type { Post } from "@/lib/api";
import { formatSiteDate } from "@/lib/date-time";
import { cn } from "@/lib/utils";

interface PostNavigationProps {
  post: Post;
  posts: Post[];
}

/** Older / newer links shown right after a post, so reading never ends in a dead end. */
export const PostPager = ({ post, posts }: PostNavigationProps) => {
  const index = posts.findIndex((item) => item.id === post.id);
  if (index === -1) return null;
  // The API lists posts newest first.
  const newer = posts[index - 1];
  const older = posts[index + 1];
  if (!newer && !older) return null;

  const linkClass = "group flex min-w-0 flex-1 flex-col gap-1 rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5";

  return (
    <nav aria-label="Други публикации" className="mt-6 flex flex-col gap-3 sm:flex-row">
      {older ? (
        <Link to={`/post/${older.id}`} className={linkClass}>
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            По-стара
          </span>
          <span className="line-clamp-2 font-bold leading-snug group-hover:text-primary">{older.title}</span>
        </Link>
      ) : <span className="hidden flex-1 sm:block" />}
      {newer ? (
        <Link to={`/post/${newer.id}`} className={cn(linkClass, "sm:items-end sm:text-right")}>
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            По-нова
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
          <span className="line-clamp-2 font-bold leading-snug group-hover:text-primary">{newer.title}</span>
        </Link>
      ) : <span className="hidden flex-1 sm:block" />}
    </nav>
  );
};

/** Up to three other posts, preferring ones that share a category with the current post. */
export const RelatedPosts = ({ post, posts }: PostNavigationProps) => {
  const categoryIds = new Set(post.categories.map((category) => category.id));
  const others = posts.filter((item) => item.id !== post.id);
  const sameCategory = others.filter((item) => item.categories.some((category) => categoryIds.has(category.id)));
  const related = [...sameCategory, ...others.filter((item) => !sameCategory.includes(item))].slice(0, 3);
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-posts-title" className="mt-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 id="related-posts-title" className="text-2xl font-black tracking-tight sm:text-3xl">Още новини</h2>
        <Link to="/news" className="shrink-0 text-sm font-bold text-primary hover:underline underline-offset-4">Всички новини</Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-3">
        {related.map((item) => (
          <li key={item.id}>
            <Link
              to={`/post/${item.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="aspect-[16/9] overflow-hidden bg-muted">
                <img
                  src={item.banner || "/logo-light.png"}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <span className="line-clamp-3 font-bold leading-snug group-hover:text-primary">{item.title}</span>
                <time className="mt-auto text-xs text-muted-foreground" dateTime={item.published_at || item.created_at}>
                  {formatSiteDate(item.published_at || item.created_at)}
                </time>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
