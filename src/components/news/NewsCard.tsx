import { ArrowUpRight, Calendar, Eye, Share2, Tag, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Post } from "@/lib/api";
import { formatSiteDate } from "@/lib/date-time";
import { formatMonthlyViews } from "@/lib/post-analytics";
import { getPostShareUrl } from "@/lib/share";
import { publicProfilePath } from '@/lib/public-profile';
import SiteRoleBadge from '@/components/SiteRoleBadge';

interface NewsCardProps {
  article: Post;
  priority?: boolean;
}

async function shareArticle(article: Post) {
  const url = getPostShareUrl(article.id);

  try {
    if (navigator.share) {
      await navigator.share({ url });
      return;
    }

    await navigator.clipboard.writeText(url);
    toast.success("Връзката е копирана успешно!");
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    toast.error("Грешка при споделяне на публикацията.");
  }
}

const displayCategories = (article: Post) => {
  const names = article.categories.map((c) => c.full_name);
  if (names.length === 0) return "Без категория";
  if (names.length <= 2) return names.join(" · ");
  return `${names[0]} · ${names[1]} · +${names.length - 2}`;
};

const NewsCard = ({ article, priority = false }: NewsCardProps) => (
  <Card className="group relative h-full overflow-hidden transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-2xl hover:shadow-primary/10 motion-reduce:hover:translate-y-0">
    <article className="flex h-full flex-col">
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
      <img
        src={article.banner || "/logo-light.png"}
        alt=""
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
        decoding="async"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />
      <Badge className="absolute bottom-3 left-3 border-white/20 bg-slate-950/65 text-white shadow-lg backdrop-blur-md hover:bg-slate-950/75">
        <Tag className="mr-1.5 h-3 w-3" aria-hidden="true" />{displayCategories(article)}
      </Badge>
      <button
        type="button"
        onClick={() => void shareArticle(article)}
        className="absolute right-3 top-3 z-10 rounded-xl border border-white/10 bg-black/60 p-2 text-white backdrop-blur-sm transition-[transform,background-color] duration-200 hover:scale-105 hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95"
        aria-label={`Сподели: ${article.title}`}
      >
        <Share2 className="h-4 w-4" />
      </button>
    </div>

    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <h2 className="text-balance text-xl font-black leading-snug tracking-tight sm:text-2xl">
        {/* The title link stretches over the whole card, so the card is one big tap target. */}
        <Link to={`/post/${article.id}`} className="rounded transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {article.title}
        </Link>
      </h2>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{article.hook}</p>
      <div className="mt-auto pt-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" aria-hidden="true" /><time dateTime={article.published_at || article.created_at}>{formatSiteDate(article.published_at || article.created_at, { day: "numeric", month: "short", year: "numeric" })}</time></span>
          <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" aria-hidden="true" />{formatMonthlyViews(article.views_this_month)}</span>
          {article.author_username && <Link to={publicProfilePath(article.author_username)} className="relative z-10 flex min-w-0 items-center gap-1.5 rounded hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><UserRound className="h-3.5 w-3.5" aria-hidden="true" /><span className="truncate">{article.author_username}</span><SiteRoleBadge role={article.author_site_role} compact /></Link>}
        </div>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary" aria-hidden="true">
          Прочети публикацията <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
    </article>
  </Card>
);

export default NewsCard;
