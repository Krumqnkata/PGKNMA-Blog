import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MousePointerClick } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getEvents, Event } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { bg } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import EventCard from "@/components/events/EventCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { ContentSkeleton, QueryErrorState } from "@/components/query/QueryStates";
import { InteriorPage, InteriorPageHero, InteriorSection, SectionHeading } from "@/components/InteriorPage";

const SchoolCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const isMobile = useIsMobile();

  const { data: events, isLoading, isError, error, refetch } = useQuery<Event[]>({
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
      <InteriorPage><InteriorSection><ContentSkeleton count={3} label="Зареждане на училищния календар" /></InteriorSection></InteriorPage>
    );
  }

  if (isError) {
    return (
      <InteriorPage><InteriorSection><QueryErrorState message={error?.message} onRetry={() => void refetch()} /></InteriorSection></InteriorPage>
    );
  }

  return (
    <InteriorPage>
      <InteriorPageHero
        eyebrow="Планирай навреме"
        title={<>Училищен <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">календар</span></>}
        description="Важните дати, инициативи и събития на едно място — с бърз преглед по ден и категория."
        icon={CalendarDays}
      />

      <InteriorSection>
        <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <Card className="overflow-hidden lg:sticky lg:top-24 lg:col-span-5">
            <div className="border-b border-border/60 bg-gradient-to-r from-primary/10 to-transparent px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Избери дата</p>
              <h2 className="mt-1 text-xl font-black">Преглед по ден</h2>
            </div>
            <CardContent className="p-3 sm:p-5">
              <div className="overflow-x-auto">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  eventsByDate={eventsByDate}
                  className="mx-auto min-w-[280px] rounded-xl border-0"
                  classNames={{
                    months: "flex flex-col space-y-4",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-base font-bold capitalize",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-9 w-9 rounded-lg bg-muted/60 p-0 opacity-80 hover:opacity-100",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-lg w-10 font-semibold text-[0.7rem] uppercase sm:w-12 sm:text-xs",
                    row: "flex w-full mt-2",
                    cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary/10 [&:has([aria-selected])]:rounded-xl focus-within:relative focus-within:z-20 sm:h-12 sm:w-12",
                    day: "h-10 w-10 rounded-xl p-0 font-semibold aria-selected:opacity-100 sm:h-12 sm:w-12",
                    day_selected: "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary hover:text-primary-foreground",
                    day_today: "border border-primary/40 bg-primary/5 text-primary",
                    day_outside: "text-muted-foreground opacity-35",
                  }}
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-muted/45 px-3 py-2.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]" />Дните с точка съдържат събитие
              </div>
            </CardContent>
          </Card>

          <Card className="min-h-[26rem] overflow-hidden lg:col-span-7">
            <div className="flex flex-col gap-4 border-b border-border/60 bg-gradient-to-r from-blue-500/10 to-transparent p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Избрана дата</p>
                <h2 className="mt-1 text-2xl font-black capitalize sm:text-3xl">{selectedDate ? format(selectedDate, "d MMMM", { locale: bg }) : "Изберете ден"}</h2>
              </div>
              <div className="inline-flex w-fit items-center rounded-full border bg-background/70 px-3 py-1.5 text-sm font-bold shadow-sm">{selectedDateEvents.length} {selectedDateEvents.length === 1 ? "събитие" : "събития"}</div>
            </div>
            <CardContent className="p-4 sm:p-6">
              {selectedDateEvents.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/70 bg-muted/20 px-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><CalendarDays className="h-7 w-7" aria-hidden="true" /></div>
                  <p className="mt-4 font-bold">Денят е свободен</p>
                  <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">Няма публикувани събития за тази дата. Изберете ден, отбелязан с точка.</p>
                </div>
              ) : (
                <div className="space-y-3">{selectedDateEvents.map((event) => <EventCard key={event.id} event={event} isMobile={isMobile} />)}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-14 sm:mt-18">
          <SectionHeading
            eyebrow="Предстоящи"
            title="Всички събития"
            description="Филтрирайте календара и отворете карта за пълните детайли."
            action={<div className="flex items-center gap-2 rounded-full bg-muted/60 px-3 py-2 text-xs text-muted-foreground"><MousePointerClick className="h-4 w-4 text-primary" aria-hidden="true" />Избери карта за детайли</div>}
          />
          <div className="mb-7 flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-card/60 p-3">
            {categories.map((category) => (
              <Button key={category} variant={category === selectedCategory ? "default" : "outline"} size="sm" aria-pressed={category === selectedCategory} onClick={() => setSelectedCategory(category)}>{category === "All" ? "Всички" : category}</Button>
            ))}
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{upcomingEvents.map((event) => <EventCard key={event.id} event={event} isMobile={isMobile} compact />)}</div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-border/70 bg-card/50 p-10 text-center text-muted-foreground">Няма предстоящи събития в тази категория.</div>
          )}
        </div>
      </InteriorSection>
    </InteriorPage>
  );
};

export default SchoolCalendar;
