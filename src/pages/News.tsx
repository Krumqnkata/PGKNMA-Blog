import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { getPosts, Post } from '@/lib/api';
import NewsCard from "@/components/news/NewsCard";
import NewsPagination from "@/components/news/NewsPagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ContentSkeleton, QueryEmptyState, QueryErrorState } from "@/components/query/QueryStates";
import { InteriorPage, InteriorPageHero, InteriorSection, SectionHeading } from "@/components/InteriorPage";

const ITEMS_PER_PAGE = 9;

const News = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebouncedValue(searchQuery, 300);
    const { data: posts = [], isLoading, error, refetch } = useQuery<Post[], Error>({
      queryKey: ['posts'],
      queryFn: getPosts,
      staleTime: 5 * 60 * 1000,
    });

    const categorySlug = searchParams.get('category') || null;

    const categories = useMemo(() => {
      const names = new Set<string>();
      for (const post of posts) {
        for (const c of post.categories) {
          names.add(c.full_name);
        }
      }
      return [...names].sort((a, b) => a.localeCompare(b, 'bg'));
    }, [posts]);

    const setSelectedCategory = (name: string | null) => {
      if (name) {
        setSearchParams({ category: name });
      } else {
        setSearchParams({});
      }
    };

    const filteredPosts = useMemo(() => {
      const normalizedSearch = debouncedSearch.trim().toLocaleLowerCase('bg');
      return posts.filter((post) => {
        const matchesCategory = !categorySlug || post.categories.some((c) => c.full_name === categorySlug);
        if (!matchesCategory || !normalizedSearch) return matchesCategory;

        return [post.title, post.content, post.author_username]
          .some((value) => value?.toLocaleLowerCase('bg').includes(normalizedSearch));
      });
    }, [debouncedSearch, posts, categorySlug]);

    // The page lives in the URL so the browser's Back button returns to the same page of results.
    const pageCount = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
    const requestedPage = Math.floor(Number(searchParams.get('page')) || 1);
    const currentPage = Math.min(Math.max(1, requestedPage), Math.max(1, pageCount));
    const visiblePosts = useMemo(
      () => filteredPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
      [currentPage, filteredPosts],
    );

    const handleSearchChange = (value: string) => {
      setSearchQuery(value);
      if (searchParams.has('page')) {
        setSearchParams((params) => {
          const next = new URLSearchParams(params);
          next.delete('page');
          return next;
        }, { replace: true });
      }
    };

    const handlePageChange = (page: number) => {
      if (page === currentPage) return;
      setSearchParams((params) => {
        const next = new URLSearchParams(params);
        if (page > 1) next.set('page', String(page));
        else next.delete('page');
        return next;
      });
      const results = document.getElementById('news-results');
      results?.focus({ preventScroll: true });
      results?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    };

    const clearFilters = () => {
      setSearchQuery('');
      setSelectedCategory(null);
    };

    return (
      <InteriorPage>
        <InteriorPageHero
          eyebrow="Училищен информационен център"
          title={<>Последни <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">новини</span></>}
          description="Събития, успехи и важни моменти от живота на ПГКНМА — подредени ясно и лесни за откриване."
          art="newspaper"
        >
          {!isLoading && (
            <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-xl border bg-card/70 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
              <span className="font-black text-foreground">{posts.length}</span> публикации в <span className="font-black text-foreground">{categories.length || 1}</span> категории
            </div>
          )}
        </InteriorPageHero>

        <InteriorSection>
          <div className="mb-10 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-lg shadow-black/5 backdrop-blur sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder="Търсене по заглавие, съдържание или автор..."
                  value={searchQuery}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  className="h-12 pl-11"
                  aria-label="Търсене в публикациите"
                />
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground lg:self-start lg:pt-3">
                <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden="true" />Категории
              </div>
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 lg:max-w-[52%]">
                <Button className="shrink-0 rounded-full" size="sm" variant={!categorySlug ? "default" : "outline"} aria-pressed={!categorySlug} onClick={() => setSelectedCategory(null)}>Всички</Button>
                {categories.map((category) => (
                  <Button key={category} className="shrink-0 rounded-full" size="sm" variant={categorySlug === category ? "default" : "outline"} aria-pressed={categorySlug === category} onClick={() => setSelectedCategory(categorySlug === category ? null : category)}>{category}</Button>
                ))}
              </div>
            </div>
          </div>

          <div id="news-results" tabIndex={-1} aria-live="polite" className="scroll-mt-24 outline-none">
            <span className="sr-only">Страница {currentPage} от {Math.max(1, pageCount)}. {filteredPosts.length} намерени публикации.</span>
          </div>
          <SectionHeading
            eyebrow="Архив"
            title={debouncedSearch || categorySlug ? "Резултати от филтрирането" : "Всички публикации"}
            description={`${filteredPosts.length} ${filteredPosts.length === 1 ? "намерена публикация" : "намерени публикации"}`}
          />
          {isLoading ? (
            <ContentSkeleton count={6} label="Зареждане на новините" />
          ) : error ? (
            <QueryErrorState message={error.message} onRetry={() => void refetch()} />
          ) : filteredPosts.length === 0 ? (
            <div className="text-center">
              <QueryEmptyState art="newspaper" title={posts.length ? "Няма резултати" : "Все още няма публикации"} description={posts.length ? "Променете търсенето или избраната категория." : "Новите публикации ще се появят тук."} />
              {posts.length > 0 && (debouncedSearch || categorySlug) && <Button variant="outline" className="mt-4" onClick={clearFilters}>Изчисти филтрите</Button>}
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visiblePosts.map((article, index) => <NewsCard article={article} priority={index === 0} key={article.id} />)}
              </div>
              <NewsPagination currentPage={currentPage} pageCount={pageCount} onPageChange={handlePageChange} />
            </>
          )}
        </InteriorSection>
      </InteriorPage>
    );
};

export default News;
