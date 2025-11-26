import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";

const Events = () => {
  const upcomingEvents = [
    {
      id: 1,
      day: "25",
      month: "NOV",
      title: "Parent-Teacher Conference",
      time: "3:00 PM - 6:00 PM",
      location: "Main Auditorium",
    },
    {
      id: 2,
      day: "02",
      month: "DEC",
      title: "Winter Concert",
      time: "7:00 PM - 9:00 PM",
      location: "School Theater",
    },
    {
      id: 3,
      day: "10",
      month: "DEC",
      title: "Holiday Break Begins",
      time: "Last Day of Classes",
      location: "School Campus",
    },
  ];

  return (
    <section className="border-b border-border py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold sm:text-4xl">Upcoming Events</h2>
          <p className="text-lg text-muted-foreground">
            Mark your calendars for these important dates
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
                    <span className="text-2xl font-bold leading-none">{event.day}</span>
                    <span className="text-sm font-medium uppercase">{event.month}</span>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold leading-tight">{event.title}</h3>
                    
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{event.time}</span>
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
            href="#"
            className="inline-flex items-center gap-2 text-lg font-medium text-primary transition-all hover:gap-3"
          >
            View Full Calendar
            <Calendar className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Events;
