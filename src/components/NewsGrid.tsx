import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, Eye } from "lucide-react";
import type { Post } from "@/lib/api";
import { usePosts } from "@/hooks/use-posts";
import { formatSiteDate } from "@/lib/date-time";
import { formatMonthlyViews } from "@/lib/post-analytics";
import { LoadingCaption } from "@/components/query/QueryStates";

const displayCategories = (post: Post) => {
  const names = post.categories.map((c) => c.full_name);
  if (names.length === 0) return "Без категория";
  if (names.length <= 2) return names.join(" · ");
  return `${names[0]} · ${names[1]} · +${names.length - 2}`;
};

const NewsGrid = () => {
  const { data, isPending: loading, error: queryError } = usePosts();
  const posts = data?.slice(0, 6) || [];
  const error = queryError?.message;

  const getReadTime = (content: string, hook: string) => {
    const text = `${content} ${hook}`;
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  return (
    <section id="home-news" className="relative scroll-mt-[var(--site-header-height)] overflow-hidden border-b border-border py-10 lg:py-14">
      <div className="absolute inset-0 bg-[radial-gradient(45%_45%_at_50%_50%,var(--primary-foreground)_0%,transparent_100%)] opacity-[0.03]" />

      <div className="container relative mx-auto px-4">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:mb-12 lg:flex-row lg:items-end lg:gap-6">
          <div className="max-w-2xl text-left">
            <h2 className="mb-4 text-4xl font-black tracking-tighter sm:text-5xl lg:text-6xl uppercase">
              Последни <span className="text-primary italic">Новини</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Бъдете информирани с най-новите публикации и съобщения за училищния живот.
              Подбрано съдържание от сърцето на ПГКНМА.
            </p>
          </div>
          <Link 
            to="/news" 
            className="group inline-flex items-center gap-2 text-lg font-bold uppercase tracking-widest text-primary transition-all hover:gap-4"
          >
            Всички новини
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {loading ? (
            // Show skeleton loaders
            <div role="status" aria-label="Зареждане на последните новини" className="col-span-12 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
               <LoadingCaption label="Зареждане на последните новини" className="col-span-12" />
               <Card className="col-span-12 lg:col-span-8 h-[500px] animate-pulse bg-card/50" />
               <div className="col-span-12 lg:col-span-4 space-y-6">
                  <Card className="h-40 animate-pulse bg-card/50" />
                  <Card className="h-40 animate-pulse bg-card/50" />
                  <Card className="h-40 animate-pulse bg-card/50" />
               </div>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-20 text-destructive border border-destructive/20 rounded-2xl bg-destructive/5">
              <p className="text-xl font-bold">{error}</p>
            </div>
          ) : posts.length > 0 ? (
            <>
              {/* Featured Post (1st item) */}
              <div className="col-span-12 lg:col-span-8">
                <Link to={`/post/${posts[0].id}`} className="group block">
                  <article className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
                    <div className="relative aspect-[16/9] w-full overflow-hidden flex flex-col justify-end p-5 sm:p-8 lg:p-12">

                      <img
                        src={posts[0].banner || '/logo-light.png'}
                        alt={posts[0].title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      
                      {/* Overlay Content */}
                      <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left text-white w-full">
                        <div className="mb-3 flex flex-wrap justify-center lg:justify-start items-center gap-2 sm:gap-4 text-[9px] sm:text-sm font-bold uppercase tracking-wider w-full">
                          <Badge className="bg-primary px-2 py-0.5 sm:px-4 sm:py-1.5 text-[9px] sm:text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg shrink-0">
                            {displayCategories(posts[0])}
                          </Badge>
                          <span className="flex items-center gap-1 opacity-80 whitespace-nowrap">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                            {formatSiteDate(posts[0].published_at || posts[0].created_at, { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1 opacity-80 whitespace-nowrap">
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            {formatMonthlyViews(posts[0].views_this_month)}
                          </span>
                          <span className="opacity-80 whitespace-nowrap">{getReadTime(posts[0].content, posts[0].hook)} мин. четене</span>
                        </div>
                        
                        <h3 className="mb-2 sm:mb-4 text-xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tighter group-hover:text-primary transition-colors">
                          {posts[0].title}
                        </h3>
                        
                        <p className="line-clamp-2 text-xs sm:text-lg opacity-90 leading-relaxed max-w-2xl">
                          {posts[0].hook}
                        </p>
                      </div>
                    </div>
                  </article>
                </Link>
              </div>

              {/* Side Column (Items 2-4) */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 sm:gap-8">
                {posts.slice(1, 4).map((item, idx) => (
                  <Link key={item.id} to={`/post/${item.id}`} className="group block">
                    <article className="relative flex items-center gap-4 sm:gap-6 rounded-2xl border border-transparent p-2 sm:p-4 transition-all duration-300 hover:border-border hover:bg-card hover:shadow-xl overflow-hidden">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-32 sm:w-32">
                        <img
                          src={item.banner || '/logo-light.png'}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      
                      <div className="flex flex-col justify-center min-w-0 flex-1">
                        <Badge variant="outline" className="mb-1 sm:mb-2 w-fit border-primary/20 bg-primary/5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary">
                          {displayCategories(item)}
                        </Badge>
                        <h4 className="line-clamp-2 text-base font-bold leading-tight group-hover:text-primary transition-colors sm:text-xl">
                          {item.title}
                        </h4>
                        <p className="line-clamp-2 text-xs text-muted-foreground mt-1 mb-1">
                          {item.hook}
                        </p>
                        <div className="mt-1 sm:mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-xs font-medium text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatSiteDate(item.published_at || item.created_at)}</span>
                          <span className="mx-1">•</span>
                          {getReadTime(item.content, item.hook)} мин. четене
                          <span className="flex basis-full items-center gap-1"><Eye className="h-3 w-3" />{formatMonthlyViews(item.views_this_month)}</span>
                        </div>
                      </div>
                      
                      {/* Subtle index number background - adjusted for mobile */}
                      <span className="absolute -right-1 -top-2 select-none text-4xl sm:text-6xl font-black text-primary/5 transition-colors group-hover:text-primary/10">
                        0{idx + 2}
                      </span>
                    </article>
                  </Link>
                ))}

              </div>
            </>
          ) : (
            <div className="col-span-full py-20 text-center text-muted-foreground">
               Няма намерени новини.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsGrid;
