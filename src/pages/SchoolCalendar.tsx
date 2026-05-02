import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, MousePointerClick } from "lucide-react";
import CookieConsent from "@/components/CookieConsent";
import { useQuery } from "@tanstack/react-query";
import { getEvents, Event } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { bg } from "date-fns/locale";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

const SchoolCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { data: events, isLoading, isError, error } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: getEvents,
    staleTime: 5 * 60 * 1000,
  });

  // Events for selected date - use date string comparison to avoid timezone issues
  const selectedDateEvents = useMemo(() => {
    if (!events || !selectedDate) return [];
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    return events.filter((event) => {
      const eventDateStr = format(parseISO(event.start_datetime), "yyyy-MM-dd");
      return eventDateStr === selectedDateStr;
    });
  }, [events, selectedDate]);

  // Events grouped by date for calendar indicators
  const eventsByDate = useMemo(() => {
    if (!events) return new Map<string, number>();
    const map = new Map<string, number>();
    events.forEach((event) => {
      const dateKey = format(parseISO(event.start_datetime), "yyyy-MM-dd");
      map.set(dateKey, (map.get(dateKey) || 0) + 1);
    });
    return map;
  }, [events]);

  const categories = useMemo(() => {
    if (!events) return ["All"];
    const uniqueCategories = Array.from(new Set(events.map((event) => event.category)));
    return ["All", ...uniqueCategories];
  }, [events]);

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
        <section className="w-full bg-gradient-to-br from-primary/20 via-background to-background py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">Училищен календар</h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              Изберете дата, за да видите събитията за нея.
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
                    variant={category === "All" ? "default" : "outline"}
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
                {events
                  .filter((event) => {
                    const isFutureEvent = parseISO(event.start_datetime) >= new Date();
                    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
                    return isFutureEvent && matchesCategory;
                  })
                  .sort((a, b) => parseISO(a.start_datetime).getTime() - parseISO(b.start_datetime).getTime())
                  .map((event) => (
                    <EventCardCompact key={event.id} event={event} />
                  ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
      <CookieConsent />
    </div>
  );
};

// Event Card Component for selected date events
const EventCard = ({ event, isMobile }: { event: Event; isMobile: boolean }) => {
  const [open, setOpen] = useState(false);

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

  const startDate = parseISO(event.start_datetime);
  const endDate = event.end_datetime ? parseISO(event.end_datetime) : null;

  return (
    <>
      <Card
        className="cursor-pointer transition-all duration-200 hover:shadow-md overflow-hidden"
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex gap-2 sm:gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 sm:h-14 sm:w-14">
              <span className="text-base font-bold text-primary sm:text-lg">
                {format(startDate, "d", { locale: bg })}
              </span>
              <span className="text-[10px] text-muted-foreground sm:text-xs">
                {format(startDate, "MMM", { locale: bg })}
              </span>
            </div>
            <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold sm:text-base line-clamp-2 break-words">{event.title}</h3>
                <Badge className={`text-[10px] sm:text-xs flex-shrink-0 ${getCategoryColor(event.category)}`}>
                  {event.category}
                </Badge>
              </div>
              
              {/* Date and Time Range */}
              <div className="flex flex-col gap-1 text-[10px] text-muted-foreground sm:text-xs">
                <div className="flex items-center gap-1 min-w-0">
                  <Calendar className="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
                  <span className="truncate">
                    {format(startDate, "dd.MM.yyyy", { locale: bg })}
                    {endDate && ` - ${format(endDate, "dd.MM.yyyy", { locale: bg })}`}
                  </span>
                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <Clock className="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
                  <span className="truncate">
                    {format(startDate, "HH:mm", { locale: bg })}
                    {endDate && ` - ${format(endDate, "HH:mm", { locale: bg })}`}
                  </span>
                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin className="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
              
              {/* Markdown Description with line clamp */}
              <div className="text-[10px] text-muted-foreground line-clamp-2 break-words sm:text-xs prose prose-sm max-w-none">
                <MarkdownRenderer content={event.description} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile: Sheet, Desktop: Dialog */}
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="pr-8">{event.title}</SheetTitle>
              <SheetDescription>
                {format(parseISO(event.start_datetime), "dd.MM.yyyy", { locale: bg })} • {format(parseISO(event.start_datetime), "HH:mm", { locale: bg })}
              </SheetDescription>
            </SheetHeader>
            <EventDetails event={event} />
            <SheetClose className="absolute right-4 top-4" />
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{event.title}</DialogTitle>
              <DialogDescription>
                {format(parseISO(event.start_datetime), "dd.MM.yyyy", { locale: bg })} • {format(parseISO(event.start_datetime), "HH:mm", { locale: bg })}
              </DialogDescription>
            </DialogHeader>
            <EventDetails event={event} />
            <DialogClose className="absolute right-4 top-4" />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

// Event Details Component
const EventDetails = ({ event }: { event: Event }) => {
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

  return (
    <div className="mt-4 space-y-4">
      <Badge className={`${getCategoryColor(event.category)}`}>
        {event.category}
      </Badge>

      <div className="space-y-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="truncate">
            {format(parseISO(event.start_datetime), "dd.MM.yyyy", { locale: bg })}
            {event.end_datetime && ` - ${format(parseISO(event.end_datetime), "dd.MM.yyyy", { locale: bg })}`}
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="truncate">
            {format(parseISO(event.start_datetime), "HH:mm", { locale: bg })}
            {event.end_datetime && ` - ${format(parseISO(event.end_datetime), "HH:mm", { locale: bg })}`}
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
        {event.attendees_text && (
          <div className="flex items-center gap-2 min-w-0">
            <Users className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">{event.attendees_text}</span>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="max-w-full overflow-hidden">
          <MarkdownRenderer content={event.description} />
        </div>
      </div>
    </div>
  );
};

// Compact Event Card for "All Events" section
const EventCardCompact = ({ event }: { event: Event }) => {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const startDate = parseISO(event.start_datetime);
  const endDate = event.end_datetime ? parseISO(event.end_datetime) : null;

  return (
    <>
      <Card 
        className="cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-md"
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex gap-2 sm:gap-3">
            <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10">
              <span className="text-lg font-bold text-primary">
                {format(startDate, "d", { locale: bg })}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(startDate, "MMM", { locale: bg })}
              </span>
            </div>
            <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
              <h3 className="text-sm font-semibold line-clamp-2 break-words">{event.title}</h3>
              <Badge className={`text-[10px] sm:text-xs ${getCategoryColor(event.category)}`}>
                {event.category}
              </Badge>
              <div className="flex flex-col gap-1 text-[10px] text-muted-foreground sm:text-xs">
                <div className="flex items-center gap-1 min-w-0">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {format(startDate, "dd.MM.yyyy", { locale: bg })}
                    {endDate && ` - ${format(endDate, "dd.MM.yyyy", { locale: bg })}`}
                  </span>
                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {format(startDate, "HH:mm", { locale: bg })}
                    {endDate && ` - ${format(endDate, "HH:mm", { locale: bg })}`}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground line-clamp-2 break-words prose prose-xs max-w-none">
                <MarkdownRenderer content={event.description} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile: Sheet, Desktop: Dialog */}
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="pr-8">{event.title}</SheetTitle>
              <SheetDescription>
                {format(startDate, "dd.MM.yyyy", { locale: bg })} • {format(startDate, "HH:mm", { locale: bg })}
              </SheetDescription>
            </SheetHeader>
            <EventDetails event={event} />
            <SheetClose className="absolute right-4 top-4" />
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{event.title}</DialogTitle>
              <DialogDescription>
                {format(startDate, "dd.MM.yyyy", { locale: bg })} • {format(startDate, "HH:mm", { locale: bg })}
              </DialogDescription>
            </DialogHeader>
            <EventDetails event={event} />
            <DialogClose className="absolute right-4 top-4" />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default SchoolCalendar;
