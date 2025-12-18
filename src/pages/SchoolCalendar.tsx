import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import CookieConsent from "@/components/CookieConsent";
import { useQuery } from "@tanstack/react-query"; // New import
import { getEvents, Event } from "@/lib/api"; // New import
import { format, parseISO } from 'date-fns'; // For date formatting

const SchoolCalendar = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: events, isLoading, isError, error } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: getEvents,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Derive categories dynamically from fetched events
  const categories = useMemo(() => {
    if (!events) return ["All"];
    const uniqueCategories = Array.from(new Set(events.map((event) => event.category)));
    return ["All", ...uniqueCategories];
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter(
      (event) => selectedCategory === "All" || event.category === selectedCategory
    );
  }, [events, selectedCategory]);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Academic: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      Sports: "bg-green-500/10 text-green-500 border-green-500/20",
      Arts: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      Community: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      Holiday: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full">
        <Header />
        <main className="py-16 text-center">
          <p className="text-lg text-muted-foreground">Зареждане на събития...</p>
        </main>
        <Footer />
        <BackToTop />
        <CookieConsent />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen w-full">
        <Header />
        <main className="py-16 text-center">
          <p className="text-lg text-destructive">Грешка при зареждане на събития: {error?.message}</p>
        </main>
        <Footer />
        <BackToTop />
        <CookieConsent />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-br from-primary/20 via-background to-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">Училищен Календар</h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Останете информирани за предстоящи събития, дейности и важни дати
            </p>
          </div>
        </section>

        {/* Filter Section */}
        <section className="w-full border-b border-border bg-background/95 py-6">
          <div className="container mx-auto px-4">
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
          </div>
        </section>

        {/* Events List */}
        <section className="w-full py-16">
          <div className="container mx-auto px-4">
            {filteredEvents.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">Няма намерени събития в тази категория.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="group overflow-hidden transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex flex-col gap-6 p-6 md:flex-row">
                      {/* Date Box */}
                      <div className="flex-shrink-0">
                        <div className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-primary bg-primary/5">
                          <span className="text-3xl font-bold text-primary">
                            {format(parseISO(event.start_datetime), 'dd')}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">
                            {format(parseISO(event.start_datetime), 'MMM')}
                          </span>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-2xl font-bold transition-colors group-hover:text-primary">
                              {event.title}
                            </h3>
                            <Badge className={`mt-2 border ${getCategoryColor(event.category)}`}>
                              {event.category}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-muted-foreground">{event.description}</p>

                        <div className="grid gap-3 text-sm md:grid-cols-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>
                              {format(parseISO(event.start_datetime), 'HH:mm')}
                              {event.end_datetime && ` - ${format(parseISO(event.end_datetime), 'HH:mm')}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4 text-primary" />
                            <span>{event.attendees_text}</span>
                          </div>
                        </div>

                        <Button variant="outline" size="sm" className="mt-2">
                          <Calendar className="mr-2 h-4 w-4" />
                          Add to Calendar
                        </Button>
                      </div>
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
      <CookieConsent/>
    </div>
  );
};

export default SchoolCalendar;
