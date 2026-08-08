import { Calendar, Share2, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Post } from "@/lib/api";

interface NewsCardProps {
  article: Post;
}

async function shareArticle(article: Post) {
  const url = `${window.location.origin}/post/${article.id}`;

  try {
    if (navigator.share) {
      await navigator.share({ title: article.title, text: article.hook, url });
      return;
    }

    await navigator.clipboard.writeText(url);
    toast.success("Връзката е копирана успешно!");
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    toast.error("Грешка при споделяне на публикацията.");
  }
}

const NewsCard = ({ article }: NewsCardProps) => (
  <Card className="group h-full overflow-hidden transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl motion-reduce:hover:translate-y-0">
    <div className="relative aspect-video w-full overflow-hidden bg-muted">
      <Link to={`/post/${article.id}`} aria-label={`Прочети: ${article.title}`}>
        <img
          src={article.banner || "/logo-light.png"}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          loading="lazy"
          decoding="async"
        />
      </Link>
      <button
        type="button"
        onClick={() => void shareArticle(article)}
        className="absolute right-3 top-3 z-10 rounded-xl border border-white/10 bg-black/60 p-2 text-white backdrop-blur-sm transition-[transform,background-color] duration-200 hover:scale-105 hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95"
        aria-label={`Сподели: ${article.title}`}
      >
        <Share2 className="h-4 w-4" />
      </button>
    </div>

    <div className="p-5 sm:p-6">
      <Badge variant="secondary" className="mb-3 text-sm font-medium">
        <Tag className="mr-1.5 h-3 w-3" />
        {article.category_name || "Без категория"}
      </Badge>
      <h2 className="mb-2 text-xl font-bold uppercase leading-snug">
        <Link to={`/post/${article.id}`} className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {article.title}
        </Link>
      </h2>
      <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{article.hook}</p>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" aria-hidden="true" />
        <time dateTime={article.published_at || article.created_at}>
          {new Date(article.published_at || article.created_at).toLocaleDateString("bg-BG")}
        </time>
      </div>
    </div>
  </Card>
);

export default NewsCard;
