import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Loader2 } from "lucide-react";
import { getPosts, Post } from "@/lib/api";

const NewsGrid = () => {
  const navigate = useNavigate();
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
        setError("Неуспешно извличане на новини. Моля, опитайте отново по-късно.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-border py-20 lg:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(45%_45%_at_50%_50%,var(--primary-foreground)_0%,transparent_100%)] opacity-[0.03]" />
      
      <div className="container relative mx-auto px-4">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
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
            <div className="col-span-12 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
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
                <Link to={`/post/${posts[0].id}`} className="group block lg:h-full">
                  <article className="relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 lg:h-full">
                    <div className="relative aspect-[16/9] overflow-hidden lg:aspect-auto lg:flex-1">
                      <img
                        src={posts[0].banner || '/logo-light.png'}
                        alt={posts[0].title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
                      
                      {/* Category Overlap */}
                      <div className="absolute left-4 top-4 sm:left-6 sm:top-6 translate-y-0 opacity-100 transition-all group-hover:-translate-y-1">
                        <Badge className="bg-primary px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-lg">
                          {posts[0].category_name}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col p-5 sm:p-8 lg:p-12 items-center text-center lg:items-start lg:text-left">
                      <div className="mb-3 sm:mb-4 flex items-center gap-3 sm:gap-4 text-[10px] sm:text-sm font-bold uppercase tracking-wider text-primary/60">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{new Date(posts[0].created_at).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      
                      <h3 className="mb-3 sm:mb-4 text-xl font-black leading-tight tracking-tighter sm:text-4xl lg:text-5xl group-hover:text-primary transition-colors">
                        {posts[0].title}
                      </h3>
                      
                      <p className="mb-5 sm:mb-6 line-clamp-3 text-xs sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                        {posts[0].hook}
                      </p>

                      <div className="mt-auto inline-flex items-center gap-2 sm:gap-3 text-sm sm:text-lg font-black uppercase tracking-widest text-primary transition-all group-hover:gap-5">
                        Прочети статията
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
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
                        />
                        <div className="absolute inset-0 bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      
                      <div className="flex flex-col justify-center min-w-0 flex-1">
                        <Badge variant="outline" className="mb-1 sm:mb-2 w-fit border-primary/20 bg-primary/5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary">
                          {item.category_name}
                        </Badge>
                        <h4 className="line-clamp-2 text-base font-bold leading-tight group-hover:text-primary transition-colors sm:text-xl">
                          {item.title}
                        </h4>
                        <div className="mt-1 sm:mt-2 flex items-center gap-2 text-[10px] sm:text-xs font-medium text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(item.created_at).toLocaleDateString('bg-BG')}</span>
                        </div>
                      </div>
                      
                      {/* Subtle index number background - adjusted for mobile */}
                      <span className="absolute -right-1 -top-2 select-none text-4xl sm:text-6xl font-black text-primary/5 transition-colors group-hover:text-primary/10">
                        0{idx + 2}
                      </span>
                    </article>
                  </Link>
                ))}

                {/* Promotional Card or Call to Action in the sidebar */}
                <div className="mt-4 flex-1 rounded-3xl bg-primary/10 p-8 border border-primary/20 overflow-hidden relative group">
                   <div className="absolute -right-8 -bottom-8 h-32 w-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                   <h5 className="text-xl font-black mb-4 relative z-10">Искате да споделите нещо?</h5>
                   <p className="text-sm text-muted-foreground mb-6 relative z-10 leading-relaxed">
                     Станете автор в нашия блог и споделете вашите истории и проекти с цялото училище.
                   </p>
                   <Button 
                     variant="outline" 
                     className="w-full border-primary/40 bg-transparent hover:bg-primary hover:text-white transition-all font-bold tracking-widest uppercase text-xs h-10"
                     onClick={() => navigate("/contact")}
                   >
                     Свържете се с нас
                   </Button>
                </div>
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
