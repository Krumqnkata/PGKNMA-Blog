import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react"; // Add Loader2 for loading state
import { useQuery } from "@tanstack/react-query"; // Import useQuery
import { getEvents, Event as EventType } from "@/lib/api"; // Import getEvents and EventType
import { format, parseISO } from 'date-fns'; // For date formatting

const Events = () => {
  const { data: events, isLoading, isError, error } = useQuery<EventType[]>({
    queryKey: ["homepageEvents"], // Unique query key
    queryFn: getEvents,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <section className="border-b border-border py-16 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg text-muted-foreground">Зареждане на събития...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="border-b border-border py-16 sm:py-20">
        <div className="container mx-auto px-4 text-center text-red-500">
          <p className="text-lg">Грешка при зареждане на събития: {error?.message}</p>
        </div>
      </section>
    );
  }

  const upcomingEvents = events
    ?.filter(event => parseISO(event.start_datetime) >= new Date()) // Revert this line
    .sort((a, b) => parseISO(a.start_datetime).getTime() - parseISO(b.start_datetime).getTime()) // Sort by date
    .slice(0, 3); // Show top 3 upcoming events

  if (!upcomingEvents || upcomingEvents.length === 0) {
    return (
      <section className="border-b border-border py-16 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-3 text-3xl font-bold sm:text-4xl">Календар на училището</h2>
          <p className="text-lg text-muted-foreground">
            Няма предстоящи събития.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-border py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold sm:text-4xl">Календар на училището</h2>
          <p className="text-lg text-muted-foreground">
            Календари на събития, ваканции и важни дати за училището.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => (
            <Card
              key={event.id}
              className="group overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Date Box */}
                  <div className="flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-110">
                    <span className="text-2xl font-bold leading-none">{format(parseISO(event.start_datetime), 'dd')}</span>
                    <span className="text-sm font-medium uppercase">{format(parseISO(event.start_datetime), 'MMM')}</span>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold leading-tight">{event.title}</h3>
                    
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{format(parseISO(event.start_datetime), 'dd.MM.yyyy HH:mm')}</span>
                        {event.end_datetime && ` - ${format(parseISO(event.end_datetime), 'dd.MM.yyyy HH:mm')}`}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Events Link */}
        <div className="mt-10 text-center">
          <a
            href="/events"
            className="inline-flex items-center gap-2 text-lg font-medium text-primary transition-all hover:gap-3"
          >
            Вижте целия календар
            <Calendar className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Events;
