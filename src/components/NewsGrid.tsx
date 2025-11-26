import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";

const NewsGrid = () => {
  const newsItems = [
    {
      id: 1,
      category: "Academics",
      title: "New STEM Program Launches This Fall",
      excerpt: "Exciting opportunities for students to explore science, technology, engineering, and mathematics through hands-on learning experiences.",
      date: "Nov 20, 2025",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
    },
    {
      id: 2,
      category: "Sports",
      title: "Basketball Team Wins Regional Championship",
      excerpt: "Our varsity basketball team secured a thrilling victory in the regional finals, showcasing exceptional teamwork and dedication.",
      date: "Nov 18, 2025",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop",
    },
    {
      id: 3,
      category: "Events",
      title: "Annual Science Fair Registration Open",
      excerpt: "Students are invited to participate in our annual science fair. Register now to showcase your innovative projects and research.",
      date: "Nov 15, 2025",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop",
    },
    {
      id: 4,
      category: "Community",
      title: "Volunteers Make a Difference in Local Community",
      excerpt: "Our student volunteers contributed over 500 hours of service this semester, making a positive impact in our community.",
      date: "Nov 12, 2025",
      image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop",
    },
  ];

  const categoryColors: Record<string, string> = {
    Academics: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    Sports: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    Events: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    Community: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  };

  return (
    <section className="border-b border-border py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold sm:text-4xl">Latest Updates</h2>
          <p className="text-lg text-muted-foreground">
            Stay informed with our most recent news and announcements
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {newsItems.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02]"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              <CardHeader className="space-y-3">
                {/* Category Badge */}
                <Badge
                  variant="outline"
                  className={`w-fit text-xs font-semibold ${categoryColors[item.category]}`}
                >
                  {item.category}
                </Badge>

                {/* Title */}
                <CardTitle className="line-clamp-2 text-lg leading-tight">
                  {item.title}
                </CardTitle>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{item.date}</span>
                </div>
              </CardHeader>

              <CardContent>
                {/* Excerpt */}
                <CardDescription className="mb-4 line-clamp-3">
                  {item.excerpt}
                </CardDescription>

                {/* Read More Link */}
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-all hover:gap-3"
                >
                  Read More
                  <ArrowRight className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsGrid;
