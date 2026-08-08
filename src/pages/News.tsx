import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Newspaper, Search, SlidersHorizontal } from "lucide-react";
import { getPosts, Post } from '@/lib/api';
import NewsCard from "@/components/news/NewsCard";
import NewsPagination from "@/components/news/NewsPagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ContentSkeleton, QueryEmptyState, QueryErrorState } from "@/components/query/QueryStates";
import { InteriorPage, InteriorPageHero, InteriorSection, SectionHeading } from "@/components/InteriorPage";

const ITEMS_PER_PAGE = 9;

const News = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebouncedValue(searchQuery, 300);
    const [currentPage, setCurrentPage] = useState(1);
    const { data: posts = [], isLoading, error, refetch } = useQuery<Post[], Error>({
      queryKey: ['posts'],
      queryFn: getPosts,
      staleTime: 5 * 60 * 1000,
    });

    const categories = useMemo(
      () => [...new Set(posts.map((post) => post.category_name).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'bg')),
      [posts],
    );

    const filteredPosts = useMemo(() => {
      const normalizedSearch = debouncedSearch.trim().toLocaleLowerCase('bg');
      return posts.filter((post) => {
        const matchesCategory = !selectedCategory || post.category_name === selectedCategory;
        if (!matchesCategory || !normalizedSearch) return matchesCategory;

        return [post.title, post.content, post.author_username]
          .some((value) => value?.toLocaleLowerCase('bg').includes(normalizedSearch));
      });
    }, [debouncedSearch, posts, selectedCategory]);

    useEffect(() => setCurrentPage(1), [debouncedSearch, selectedCategory]);

    const pageCount = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
    const visiblePosts = useMemo(
      () => filteredPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
      [currentPage, filteredPosts],
    );

    const handlePageChange = (page: number) => {
      if (page === currentPage) return;
      setCurrentPage(page);
      document.getElementById('news-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
      <InteriorPage>
        <InteriorPageHero
          eyebrow="Училищен информационен център"
          title={<>Последни <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">новини</span></>}
          description="Събития, успехи и важни моменти от живота на ПГКНМА — подредени ясно и лесни за откриване."
          icon={Newspaper}
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
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-12 pl-11"
                  aria-label="Търсене в публикациите"
                />
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground lg:self-start lg:pt-3">
                <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden="true" />Категории
              </div>
              <div className="flex flex-wrap gap-2 lg:max-w-[52%]">
                <Button size="sm" variant={selectedCategory === null ? "default" : "outline"} aria-pressed={selectedCategory === null} onClick={() => setSelectedCategory(null)}>Всички</Button>
                {categories.map((category) => (
                  <Button key={category} size="sm" variant={selectedCategory === category ? "default" : "outline"} aria-pressed={selectedCategory === category} onClick={() => setSelectedCategory(category)}>{category}</Button>
                ))}
              </div>
            </div>
          </div>

          <div id="news-results" className="scroll-mt-24" />
          <SectionHeading
            eyebrow="Архив"
            title={debouncedSearch || selectedCategory ? "Резултати от филтрирането" : "Всички публикации"}
            description={`${filteredPosts.length} ${filteredPosts.length === 1 ? "намерена публикация" : "намерени публикации"}`}
          />
          {isLoading ? (
            <ContentSkeleton count={6} label="Зареждане на новините" />
          ) : error ? (
            <QueryErrorState message={error.message} onRetry={() => void refetch()} />
          ) : filteredPosts.length === 0 ? (
            <QueryEmptyState title={posts.length ? "Няма резултати" : "Все още няма публикации"} description={posts.length ? "Променете търсенето или избраната категория." : "Новите публикации ще се появят тук."} />
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
