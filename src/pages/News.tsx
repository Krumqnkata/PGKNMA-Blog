import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, User } from "lucide-react";

const newsArticles = [
  {
    id: 1,
    title: "Annual Science Fair Winners Announced",
    excerpt: "Congratulations to all participants in this year's Science Fair. The creativity and dedication shown by our students was truly impressive.",
    category: "Academics",
    date: "2024-03-15",
    author: "Dr. Sarah Johnson",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    title: "Basketball Team Wins Regional Championship",
    excerpt: "Our varsity basketball team secured a thrilling victory in the regional championship final, defeating rivals 78-72 in overtime.",
    category: "Sports",
    date: "2024-03-12",
    author: "Coach Michael Brown",
    image: "/placeholder.svg",
  },
  {
    id: 3,
    title: "New STEM Lab Opening Next Month",
    excerpt: "We're excited to announce the opening of our state-of-the-art STEM laboratory, featuring cutting-edge equipment and technology.",
    category: "Facilities",
    date: "2024-03-10",
    author: "Principal Anderson",
    image: "/placeholder.svg",
  },
  {
    id: 4,
    title: "Spring Musical: A Night to Remember",
    excerpt: "The drama department's production of 'The Sound of Music' received standing ovations all three nights. Congratulations to the cast and crew!",
    category: "Arts",
    date: "2024-03-08",
    author: "Ms. Patricia Lee",
    image: "/placeholder.svg",
  },
  {
    id: 5,
    title: "Community Service Day Success",
    excerpt: "Over 300 students participated in our annual Community Service Day, volunteering at local organizations and making a real difference.",
    category: "Community",
    date: "2024-03-05",
    author: "Mrs. Jennifer Davis",
    image: "/placeholder.svg",
  },
  {
    id: 6,
    title: "Math Team Takes State Competition",
    excerpt: "Our math team dominated the state competition, taking first place in multiple categories and bringing home the overall championship trophy.",
    category: "Academics",
    date: "2024-03-01",
    author: "Mr. Robert Chen",
    image: "/placeholder.svg",
  },
];

const categories = ["All", "Academics", "Sports", "Arts", "Facilities", "Community"];

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = newsArticles.filter((article) => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen w-full">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-br from-primary/20 via-background to-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">Последни новини</h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Останете информирани за всичко, което се случва в нашето училище
            </p>
          </div>
        </section>

        {/* Filter and Search Section */}
        <section className="w-full border-b border-border bg-background/95 py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* News Grid */}
        <section className="w-full py-16">
          <div className="container mx-auto px-4">
            {filteredArticles.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">No news articles found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.map((article) => (
                  <Card
                    key={article.id}
                    className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:scale-[1.02]"
                  >
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <Badge variant="secondary" className="mb-3">
                        {article.category}
                      </Badge>
                      <h3 className="mb-2 text-xl font-bold transition-colors group-hover:text-primary">
                        {article.title}
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(article.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{article.author}</span>
                        </div>
                      </div>
                      <Button variant="link" className="mt-4 h-auto p-0 text-primary">
                        Read More →
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default News;
