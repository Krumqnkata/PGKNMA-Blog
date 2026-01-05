import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Import Input
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Loader2, Tag, Search } from "lucide-react"; // Import Search
import CookieConsent from "@/components/CookieConsent";
import { Link } from "react-router-dom";
import { getPosts, Post } from '@/lib/api';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const News = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(''); // State for search input
    const debouncedSearch = useDebounce(searchQuery, 500); // Debounced search query

    useEffect(() => {
        // Fetch all posts just once when the component mounts
        const fetchAllPosts = async () => {
            setLoading(true);
            const data = await getPosts(); // Always fetch all posts
            if (data) {
                setPosts(data);
                const uniqueCategories = [...new Set(data.map(post => post.category_name))];
                setCategories(uniqueCategories);
            }
            setLoading(false);
        };
        fetchAllPosts();
    }, []);

    // Combined filtering logic in a single useEffect
    useEffect(() => {
        let tempPosts = posts;

        // Apply search filter first
        if (debouncedSearch) {
            tempPosts = tempPosts.filter(post =>
                post.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                post.content.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                post.author_username.toLowerCase().includes(debouncedSearch.toLowerCase())
            );
        }

        // Then apply category filter on the result of the search filter
        if (selectedCategory) {
            tempPosts = tempPosts.filter(post => post.category_name === selectedCategory);
        }

        setFilteredPosts(tempPosts);
    }, [posts, debouncedSearch, selectedCategory]);

    return (
        <div className="min-h-screen w-full bg-background">
            <Header />
            <main>
                {/* Hero Section */}
                <section className="w-full bg-gradient-to-br from-primary/10 via-transparent to-transparent py-16 md:py-24">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">Последни новини</h1>
                        <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                            Останете информирани за всичко, което се случва в нашето училище.
                        </p>
                    </div>
                </section>
                
                {/* Filters and News Grid */}
                <section className="w-full py-12">
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

                        {loading ? (
                            <div className="py-12 text-center flex justify-center items-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-lg text-muted-foreground ml-3">Зареждане на новините...</p>
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-lg text-muted-foreground">Няма намерени публикации, съответстващи на вашето търсене.</p>
                            </div>
                        ) : (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {filteredPosts.map((article) => (
                                    <Link to={`/post/${article.id}`} key={article.id} className="group block">
                                        <Card
                                            className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full"
                                        >
                                            <div className="aspect-video w-full overflow-hidden bg-muted">
                                                <img
                                                    src={article.banner || "/logo-light.png"} 
                                                    //alt={article.title}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </div>

                                            <div className="p-6">
                                                <Badge variant="secondary" className="mb-3 text-sm font-medium">
                                                    <Tag className="h-3 w-3 mr-1.5" />
                                                    {article.category_name || "Uncategorized"}
                                                </Badge>
                                                <h3 className="mb-2 text-xl font-bold leading-snug transition-colors group-hover:text-primary">
                                                    {article.title}
                                                </h3>
                                                <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                                                    {article.hook}
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        <span>{article.author_username || `User ID: ${article.author}`}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{new Date(article.created_at).toLocaleDateString('bg-BG')}</span> 
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
            <BackToTop />
            <CookieConsent/>
        </div>
    );
};

export default News;