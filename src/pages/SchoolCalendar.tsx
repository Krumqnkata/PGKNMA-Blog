import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MousePointerClick } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getEvents, Event } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { bg } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import EventCard from "@/components/events/EventCard";
import { useIsMobile } from "@/hooks/use-mobile";

const SchoolCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const isMobile = useIsMobile();

  const { data: events, isLoading, isError, error } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: getEvents,
    staleTime: 5 * 60 * 1000,
  });

  // Events for selected date - use date string comparison to avoid timezone issues
  const selectedDateEvents = useMemo(() => {
    if (!Array.isArray(events) || !selectedDate) return [];
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    return events.filter((event) => {
      const eventDateStr = format(parseISO(event.start_datetime), "yyyy-MM-dd");
      return eventDateStr === selectedDateStr;
    });
  }, [events, selectedDate]);

  // Events grouped by date for calendar indicators
  const eventsByDate = useMemo(() => {
    if (!Array.isArray(events)) return new Map<string, number>();
    const map = new Map<string, number>();
    events.forEach((event) => {
      const dateKey = format(parseISO(event.start_datetime), "yyyy-MM-dd");
      map.set(dateKey, (map.get(dateKey) || 0) + 1);
    });
    return map;
  }, [events]);

  const categories = useMemo(() => {
    if (!Array.isArray(events)) return ["All"];
    const uniqueCategories = Array.from(new Set(events.map((event) => event.category)));
    return ["All", ...uniqueCategories];
  }, [events]);

  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return (events ?? [])
      .filter((event) => parseISO(event.start_datetime).getTime() >= now)
      .filter((event) => selectedCategory === "All" || event.category === selectedCategory)
      .toSorted((a, b) => parseISO(a.start_datetime).getTime() - parseISO(b.start_datetime).getTime());
  }, [events, selectedCategory]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] w-full">
        <main className="py-16 text-center">
          <p className="text-lg text-muted-foreground">Зареждане на събития...</p>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] w-full">
        <main className="py-16 text-center">
          <p className="text-lg text-destructive">Грешка при зареждане на събития: {error?.message}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full">
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
                    Училищен <span className="text-primary italic">Календар</span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
                    Изберете дата, за да видите събитията за нея и да планирате графика си.
                </p>
            </div>
        </section>

        {/* Calendar and Events Section */}
        <section className="w-full py-8">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Calendar */}
              <div className="lg:col-span-5">
                <Card className="border-border overflow-hidden">
                  <CardContent className="p-2 sm:p-4">
                    <div className="overflow-x-auto">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        eventsByDate={eventsByDate}
                        className="rounded-md border-0 min-w-[280px]"
                        classNames={{
                          months: "flex flex-col space-y-4",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_label: "text-sm font-medium",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.7rem] sm:w-12 sm:text-[0.75rem]",
                          row: "flex w-full mt-2",
                          cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 sm:h-12 sm:w-12",
                          day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 sm:h-12 sm:w-12",
                          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                          day_today: "bg-accent text-accent-foreground",
                          day_outside: "text-muted-foreground opacity-50",
                        }}
                      />
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="truncate">Събитие</span>
                      </div>
                      <span className="truncate">Изберете дата за детайли</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Events List for Selected Date */}
              <div className="lg:col-span-7">
                <Card className="border-border overflow-hidden">
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="mb-4">
                      <h2 className="text-base font-semibold sm:text-lg md:text-xl">
                        Събития за {selectedDate ? format(selectedDate, "dd.MM.yyyy", { locale: bg }) : "—"}
                      </h2>
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        {selectedDateEvents.length} {selectedDateEvents.length === 1 ? "събитие" : selectedDateEvents.length < 5 ? "събития" : "събития"}
                      </p>
                    </div>

                    {selectedDateEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Calendar className="mb-3 h-10 w-10 text-muted-foreground/50 sm:h-12 sm:w-12" />
                        <p className="text-sm text-muted-foreground">
                          Няма събития за тази дата.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-3">
                        {selectedDateEvents.map((event) => (
                          <EventCard key={event.id} event={event} isMobile={isMobile} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* All Events Section */}
            <div className="mt-8 sm:mt-12">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold sm:text-2xl md:text-3xl">Всички събития</h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-full">
                  <MousePointerClick className="h-4 w-4" />
                  <span className="hidden sm:inline">Цъкнете върху събитие за повече информация</span>
                  <span className="sm:hidden">Цъкнете за детайли</span>
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-4 flex flex-wrap gap-1.5 sm:gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={category === selectedCategory ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="text-xs sm:text-sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Events Grid */}
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} isMobile={isMobile} compact />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SchoolCalendar;
