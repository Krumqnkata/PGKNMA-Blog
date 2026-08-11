import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { bg } from "date-fns/locale";

import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Event } from "@/lib/api";

const categoryStyles: Record<string, string> = {
  Academic: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Sports: "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400",
  Arts: "border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400",
  Community: "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  Holiday: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
};

const getCategoryStyle = (category: string) => categoryStyles[category] ?? "bg-muted text-muted-foreground";

const EventDetails = ({ event }: { event: Event }) => {
  const startDate = parseISO(event.start_datetime);
  const endDate = event.end_datetime ? parseISO(event.end_datetime) : null;

  return (
    <div className="mt-4 space-y-4">
      <Badge className={getCategoryStyle(event.category)}>{event.category}</Badge>
      <dl className="space-y-2 text-sm">
        <DetailRow icon={Calendar} label="Дата">
          {format(startDate, "dd.MM.yyyy", { locale: bg })}
          {endDate && ` – ${format(endDate, "dd.MM.yyyy", { locale: bg })}`}
        </DetailRow>
        <DetailRow icon={Clock} label="Час">
          {format(startDate, "HH:mm", { locale: bg })}
          {endDate && ` – ${format(endDate, "HH:mm", { locale: bg })}`}
        </DetailRow>
        <DetailRow icon={MapPin} label="Място">{event.location}</DetailRow>
        {event.attendees_text && <DetailRow icon={Users} label="Участници">{event.attendees_text}</DetailRow>}
      </dl>
      <div className="border-t pt-4">
        <MarkdownRenderer content={event.description} className="max-w-full overflow-hidden" />
      </div>
    </div>
  );
};

interface DetailRowProps {
  icon: typeof Calendar;
  label: string;
  children: React.ReactNode;
}

const DetailRow = ({ icon: Icon, label, children }: DetailRowProps) => (
  <div className="flex min-w-0 items-start gap-2">
    <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
    <dt className="sr-only">{label}</dt>
    <dd className="break-words">{children}</dd>
  </div>
);

interface EventCardProps {
  event: Event;
  isMobile: boolean;
  compact?: boolean;
  initialOpen?: boolean;
}

const EventCard = ({ event, isMobile, compact = false, initialOpen = false }: EventCardProps) => {
  const [open, setOpen] = useState(initialOpen);
  const startDate = parseISO(event.start_datetime);
  const endDate = event.end_datetime ? parseISO(event.end_datetime) : null;
  const formattedSummary = `${format(startDate, "dd.MM.yyyy", { locale: bg })} • ${format(startDate, "HH:mm", { locale: bg })}`;

  useEffect(() => {
    if (initialOpen) setOpen(true);
  }, [initialOpen]);

  const trigger = (
    <Card id={`event-${event.id}`} className="group h-full scroll-mt-24 overflow-hidden transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl hover:shadow-primary/10 motion-reduce:hover:translate-y-0">
      <button type="button" onClick={() => setOpen(true)} className="h-full w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" aria-haspopup="dialog">
        <CardContent className="p-3 sm:p-4">
          <div className="flex gap-3">
            <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/15 transition-transform duration-300 group-hover:scale-105">
              <span className="text-xl font-black text-primary">{format(startDate, "d", { locale: bg })}</span>
              <span className="text-xs font-bold uppercase text-muted-foreground">{format(startDate, "MMM", { locale: bg })}</span>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-base font-bold leading-snug sm:text-lg">{event.title}</h3>
                {!compact && <Badge className={`flex-shrink-0 text-[10px] sm:text-xs ${getCategoryStyle(event.category)}`}>{event.category}</Badge>}
              </div>
              {compact && <Badge className={`text-[10px] sm:text-xs ${getCategoryStyle(event.category)}`}>{event.category}</Badge>}
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 flex-shrink-0" />{format(startDate, "dd.MM.yyyy", { locale: bg })}{endDate && ` – ${format(endDate, "dd.MM.yyyy", { locale: bg })}`}</p>
                <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 flex-shrink-0" />{format(startDate, "HH:mm", { locale: bg })}{endDate && ` – ${format(endDate, "HH:mm", { locale: bg })}`}</p>
                {!compact && <p className="flex items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 flex-shrink-0" />{event.location}</p>}
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">{event.description}</p>
            </div>
          </div>
        </CardContent>
      </button>
    </Card>
  );

  return (
    <>
      {trigger}
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="max-h-[88dvh] overflow-y-auto rounded-t-2xl">
            <SheetHeader className="text-left">
              <SheetTitle className="pr-8">{event.title}</SheetTitle>
              <SheetDescription>{formattedSummary}</SheetDescription>
            </SheetHeader>
            <EventDetails event={event} />
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{event.title}</DialogTitle>
              <DialogDescription>{formattedSummary}</DialogDescription>
            </DialogHeader>
            <EventDetails event={event} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default EventCard;
