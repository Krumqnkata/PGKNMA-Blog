import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, Loader2 } from "lucide-react";
import { getPosts, Post } from "@/lib/api";

const NewsGrid = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        setLoading(true);
        const allPosts = await getPosts();
        if (allPosts && allPosts.length > 0) {
          // Get the 4 most recent posts
          setPosts(allPosts.slice(0, 4));
        }
        setError(null);
      } catch (err) {
        setError("Failed to fetch news. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

  return (
    <section className="border-b border-border py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold sm:text-4xl">Последни новини</h2>
          <p className="text-lg text-muted-foreground">
            Бъдете информирани с най-новите новини и съобщения за училищния живот.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            // Show skeleton loaders or a single spinner
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-card/50 animate-pulse">
                <div className="h-48 bg-muted"></div>
                <CardHeader>
                  <div className="h-4 w-1/4 rounded bg-muted"></div>
                  <div className="h-6 w-3/4 rounded bg-muted"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full rounded bg-muted"></div>
                  <div className="h-4 w-2/3 rounded bg-muted mt-2"></div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-full text-center text-destructive">
              <p>{error}</p>
            </div>
          ) : (
            posts.map((item) => (
              <Link
                to={`/post/${item.id}`}
                key={item.id}
                className="group block overflow-hidden rounded-lg"
              >
                <Card
                  className="group overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] bg-opacity-50 backdrop-blur-lg h-full"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.banner || 'https://via.placeholder.com/800x600'}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  <CardHeader className="space-y-3">
                    {/* Category Badge */}
                    <Badge
                      variant="outline"
                      className="w-fit border-primary/20 bg-primary/10 text-xs font-semibold text-primary"
                    >
                      {item.category_name}
                    </Badge>

                    {/* Title */}
                    <CardTitle className="line-clamp-2 text-lg leading-tight group-hover:text-primary">
                      {item.title}
                    </CardTitle>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(item.created_at).toLocaleDateString('bg-BG')}</span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Excerpt */}
                    <CardDescription className="mb-4 line-clamp-3">
                      {item.hook}
                    </CardDescription>

                    {/* Read More Link */}
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-all group-hover:gap-3">
                      Прочети повече
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsGrid;
