import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { getPosts, Post } from '@/lib/api';
import NewsCard from "@/components/news/NewsCard";
import NewsPagination from "@/components/news/NewsPagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const ITEMS_PER_PAGE = 9;

const News = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebouncedValue(searchQuery, 300);
    const [currentPage, setCurrentPage] = useState(1);
    const { data: posts = [], isLoading, error } = useQuery<Post[], Error>({
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
        <div className="w-full bg-background">
            <main>
                {/* Hero Section */}
                <section className="relative w-full overflow-hidden bg-background pt-8 pb-0 md:pt-12 md:pb-0">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
                        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[80px]" />
                    </div>
                    
                    <div className="container relative mx-auto px-4 text-center">
                        <h1 className="text-4xl font-black tracking-tighter md:text-5xl lg:text-7xl uppercase">
                            Последни <span className="text-primary italic">Новини</span> от ПГКНМА
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
                            Останете информирани за всичко, което се случва в нашето училище.
                        </p>
                    </div>
                </section>
                
                {/* Filters and News Grid */}
                <section className="w-full pt-4 pb-12">
                    <div className="container mx-auto px-4">
                        {/* Search and Category Filters */}
                        <div className="mb-12 space-y-6">
                            <div className="relative mx-auto w-full max-w-lg">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Търсене в публикации..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10"
                                />
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                <Button 
                                    variant={selectedCategory === null ? "default" : "outline"}
                                    onClick={() => setSelectedCategory(null)}
                                >
                                    Всички
                                </Button>
                                {categories.map(category => (
                                    <Button
                                        key={category}
                                        variant={selectedCategory === category ? "default" : "outline"}
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div id="news-results" className="scroll-mt-24" />
                        {isLoading ? (
                            <div className="py-12 text-center flex justify-center items-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-lg text-muted-foreground ml-3">Зареждане на новините...</p>
                            </div>
                        ) : error ? (
                            <div className="py-12 text-center text-destructive">
                                <p className="text-lg font-semibold">{error.message || 'Неуспешно извличане на новини.'}</p>
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-lg text-muted-foreground">Няма намерени публикации, съответстващи на вашето търсене.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {visiblePosts.map((article) => <NewsCard article={article} key={article.id} />)}
                                </div>

                                <NewsPagination currentPage={currentPage} pageCount={pageCount} onPageChange={handlePageChange} />
                            </>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default News;
