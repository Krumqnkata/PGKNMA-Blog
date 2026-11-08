import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query"; // Import useQuery
import { getEvents, Event as EventType } from "@/lib/api"; // Import getEvents and EventType
import { parseISO } from 'date-fns';
import { ContentSkeleton, QueryEmptyState, QueryErrorState } from "@/components/query/QueryStates";
import { formatSiteDate, formatSiteDateTime } from "@/lib/date-time";
import { SiteArt } from "@/components/art/SiteArt";

const Events = () => {
  const { data: events, isLoading, isError, error, refetch } = useQuery<EventType[]>({
    queryKey: ["homepageEvents"], // Unique query key
    queryFn: getEvents,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <section className="relative overflow-hidden border-b border-border py-10 lg:py-24 bg-primary/5">

        <div className="container mx-auto px-4"><ContentSkeleton count={3} label="Зареждане на предстоящите събития" /></div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="relative overflow-hidden border-b border-border py-10 lg:py-24 bg-primary/5">

        <div className="container mx-auto px-4"><QueryErrorState message={error?.message} onRetry={() => void refetch()} /></div>
      </section>
    );
  }

  const upcomingEvents = Array.isArray(events)
    ? events
        .filter(event => parseISO(event.start_datetime) >= new Date())
        .sort((a, b) => parseISO(a.start_datetime).getTime() - parseISO(b.start_datetime).getTime())
        .slice(0, 3)
    : []; 

  if (!upcomingEvents || upcomingEvents.length === 0) {
    return (
      <section className="relative overflow-hidden border-b border-border py-10 lg:py-24 bg-primary/5">

        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-4xl font-black tracking-tighter sm:text-5xl lg:text-6xl uppercase">Календар на <span className="text-primary italic">училището</span></h2>
          <QueryEmptyState art="calendar" title="Няма предстоящи събития" description="Новите дати ще се появят тук веднага след публикуването им." />
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden border-b border-border py-4 lg:py-8 bg-primary/5">
      <div className="absolute top-0 right-0 h-64 w-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />

      <div className="container relative mx-auto px-4">
        <div className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <SiteArt name="calendar" className="mb-3 block h-14 w-14 drop-shadow-sm" />
            <h2 className="mb-4 text-4xl font-black tracking-tighter sm:text-5xl lg:text-6xl uppercase">
              Училищен <span className="text-primary italic">Календар</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Следете всички важни дати, събития и ваканции. Организирайте своето време и не пропускайте нищо важно от училищния живот.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
             <Link
                to="/events"
                className="group inline-flex items-center gap-2 text-lg font-bold uppercase tracking-widest text-primary transition-all hover:gap-4"
              >
                Целият календар
                <Calendar className="h-5 w-5" />
              </Link>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event, idx) => (
            <Card
              key={event.id}
              className={`group relative overflow-hidden border-border bg-card transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                idx === 1 ? 'lg:translate-y-8' : '' // Asymmetry: middle card offset
              }`}
            >
              <CardContent className="p-8">
                <div className="flex flex-col gap-6">
                  {/* Date Badge */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 group-hover:rotate-3">
                      <span className="text-2xl font-black leading-none">{formatSiteDate(event.start_datetime, { day: '2-digit' })}</span>
                      <span className="text-xs font-bold uppercase tracking-wider opacity-80">{formatSiteDate(event.start_datetime, { month: 'short' })}</span>
                    </div>
                    <div className="h-px flex-1 bg-border group-hover:bg-primary/20 transition-colors" />
                  </div>

                  {/* Event Details */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black leading-tight group-hover:text-primary transition-colors">{event.title}</h3>

                    <div className="space-y-3 text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                           <Clock className="h-4 w-4" />
                        </div>
                        <span>
                           {formatSiteDateTime(event.start_datetime)}
                           {event.end_datetime && <span className="block text-xs opacity-60">до {formatSiteDateTime(event.end_datetime)}</span>}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                           <MapPin className="h-4 w-4" />
                        </div>
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Decorative background element */}
                  <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Events;
