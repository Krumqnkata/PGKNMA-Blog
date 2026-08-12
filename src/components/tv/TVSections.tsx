import type { ReactNode } from "react";
import { AlertTriangle, Calendar, Clock, LoaderCircle, MapPin, RefreshCw, Users } from "lucide-react";

import MarkdownRenderer from "@/components/MarkdownRenderer";
import { formatSiteDate, formatSiteDateTime, siteDateKey } from "@/lib/date-time";

export interface ApprovedSong {
  id: number;
  title: string;
  status: string;
  user_username: string;
  votes: number;
}

export interface Meme {
  id: number;
  title: string;
  image_url: string;
  user_username: string;
  status: "pending" | "approved" | "rejected";
  votes: number;
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  correct_answers: number;
}

export interface TVEvent {
  id: number;
  title: string;
  start_datetime: string;
  end_datetime: string | null;
  location: string;
  category: string;
  description: string;
  attendees_text: string;
}

const RANKS = ["🥇", "🥈", "🥉"];
const RANK_STYLES = ["border-yellow-400 lg:scale-105", "border-gray-300", "border-orange-400 lg:scale-95"];
const CATEGORY_STYLES: Record<string, string> = {
  Academic: "bg-blue-500 text-blue-100",
  Sports: "bg-green-500 text-green-100",
  Arts: "bg-purple-500 text-purple-100",
  Community: "bg-orange-500 text-orange-100",
  Holiday: "bg-red-500 text-red-100",
};

export function TVModulePlaceholder({ title }: { title: string }) {
  return (
    <section role="status" className="flex min-h-screen flex-col items-center justify-center px-6 pb-20 pt-28 text-center text-white">
      <LoaderCircle className="h-14 w-14 animate-spin text-blue-300 motion-reduce:animate-none" aria-hidden="true" />
      <h2 className="mt-6 text-3xl font-bold md:text-5xl">{title}</h2>
      <p className="mt-3 text-xl text-gray-300">Данните се обновяват във фонов режим…</p>
    </section>
  );
}

export function TVModuleUnavailable({ title }: { title: string }) {
  return (
    <section role="status" className="flex min-h-screen flex-col items-center justify-center px-6 pb-20 pt-28 text-center text-white">
      <div className="rounded-full border border-amber-400/40 bg-amber-400/10 p-5"><AlertTriangle className="h-12 w-12 text-amber-300" aria-hidden="true" /></div>
      <h2 className="mt-6 text-3xl font-bold md:text-5xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-xl text-gray-300">Този модул временно не е достъпен. TV екранът ще продължи, а нов опит се прави автоматично.</p>
      <div className="mt-6 flex items-center gap-2 text-blue-300"><RefreshCw className="h-5 w-5" aria-hidden="true" />Автоматично възстановяване</div>
    </section>
  );
}

export function TVDataNotice({ children }: { children: ReactNode }) {
  return <div className="fixed right-4 top-28 z-40 rounded-full border border-amber-300/30 bg-gray-950/85 px-4 py-2 text-sm text-amber-100 shadow-lg backdrop-blur" role="status">{children}</div>;
}

function InfoLink({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 max-w-4xl text-center text-base italic text-gray-300 md:mt-8 md:text-2xl">
      <span className="text-yellow-500">ℹ️</span> {children}{" "}
      <a href="https://pgknma.space" target="_blank" rel="noopener noreferrer" className="text-blue-300 underline hover:text-blue-200">pgknma.space</a>
    </p>
  );
}

function SectionShell({ title, titleClassName, children, info }: { title: string; titleClassName: string; children: ReactNode; info: ReactNode }) {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-4 pb-16 pt-24 text-white md:p-8 md:pb-20 md:pt-28">
      <h2 className={`mb-6 text-center text-3xl font-extrabold drop-shadow-lg md:mb-12 md:text-6xl ${titleClassName}`}>{title}</h2>
      {children}
      <InfoLink>{info}</InfoLink>
    </section>
  );
}

function PodiumGrid<T extends { id: number }>({ items, emptyText, renderItem }: { items: T[]; emptyText: string; renderItem: (item: T) => ReactNode }) {
  if (!items.length) return <p className="text-center text-3xl text-gray-300 md:text-5xl">{emptyText}</p>;
  return (
    <div className="flex w-full max-w-7xl flex-col items-stretch justify-center gap-4 px-2 lg:flex-row lg:gap-8 lg:px-4">
      {items.map((item, index) => (
        <article key={item.id} className={`flex min-w-0 flex-1 flex-col items-center justify-between rounded-lg border-4 bg-gray-900/80 p-4 text-center shadow-xl backdrop-blur-sm transition-transform duration-500 md:p-6 ${RANK_STYLES[index] ?? "border-gray-700"}`}>
          <span className="mb-2 text-4xl md:mb-4 md:text-6xl">{RANKS[index]}</span>
          {renderItem(item)}
        </article>
      ))}
    </div>
  );
}

export function SongsSection({ songs }: { songs: ApprovedSong[] }) {
  return (
    <SectionShell title="🎵 Топ Песни" titleClassName="text-blue-400" info="За да видите песента и да направите предложение, посетете:">
      <PodiumGrid items={songs} emptyText="Все още няма одобрени песни." renderItem={(song) => <><span className="mb-2 text-2xl font-bold leading-tight md:text-4xl">{song.title}</span><span className="mb-4 text-lg text-gray-300 md:text-2xl">({song.user_username})</span><span className="mt-auto text-2xl text-blue-300 md:text-3xl">{song.votes} гласа</span></>} />
    </SectionShell>
  );
}

export function MemesSection({ memes }: { memes: Meme[] }) {
  return (
    <SectionShell title="😂 Топ Мемета" titleClassName="text-purple-400" info="За да разгледате и качите мем, посетете:">
      <PodiumGrid items={memes} emptyText="Все още няма одобрени мемета." renderItem={(meme) => <><span className="mb-2 text-2xl font-bold leading-tight md:text-4xl">{meme.title}</span><img src={meme.image_url} alt={meme.title} className="mb-4 h-32 w-full flex-grow rounded-md bg-gray-800 object-contain p-2 md:h-40" /><span className="mb-4 text-lg text-gray-300 md:text-2xl">({meme.user_username})</span><span className="mt-auto text-2xl text-blue-300 md:text-3xl">{meme.votes} гласа</span></>} />
    </SectionShell>
  );
}

export function PollUsersSection({ users }: { users: LeaderboardEntry[] }) {
  return (
    <SectionShell title="🏆 Топ Майстори на Анкети" titleClassName="text-yellow-400" info="За да участвате в анкетите и да спечелите награди, посетете:">
      <PodiumGrid items={users} emptyText="Все още няма участници в анкетите." renderItem={(user) => <><span className="mb-2 text-2xl font-bold leading-tight md:text-4xl">{user.username}</span><span className="mt-auto text-2xl text-blue-300 md:text-3xl">{user.correct_answers} верни отговора</span></>} />
    </SectionShell>
  );
}

export function EventsSection({ events }: { events: TVEvent[] }) {
  const today = siteDateKey(new Date());
  return (
    <SectionShell title="📅 Предстоящи Събития" titleClassName="text-green-400" info="За да видите всички събития и да участвате, посетете:">
      {events.length ? (
        <div className="grid w-full max-w-7xl grid-cols-1 gap-6 px-2 md:grid-cols-2 lg:grid-cols-3 lg:px-4">
          {events.map((event, index) => {
            const startDate = event.start_datetime;
            const endDate = event.end_datetime;
            const isToday = siteDateKey(startDate) === today;
            return (
              <article key={event.id} className={`relative flex flex-col items-start rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 p-5 text-left shadow-2xl backdrop-blur-sm md:p-6 ${isToday ? "border-4 border-green-400" : "border-2 border-gray-700"} ${index === 0 ? "lg:scale-105 lg:z-10" : ""}`}>
                <span className={`mb-4 rounded-full px-3 py-1 text-sm font-semibold ${CATEGORY_STYLES[event.category] ?? "bg-gray-500 text-gray-100"}`}>{event.category}</span>
                <h3 className="mb-4 text-2xl font-bold leading-tight text-white md:text-3xl">{event.title}</h3>
                <div className="mb-4 w-full space-y-3 text-lg text-gray-300 md:text-xl">
                  <p className="flex items-center gap-3"><Calendar className="h-6 w-6 shrink-0 text-green-400" /><span>{formatSiteDate(startDate)}{endDate && ` - ${formatSiteDate(endDate)}`}</span></p>
                  <p className="flex items-center gap-3"><Clock className="h-6 w-6 shrink-0 text-green-400" /><span>{formatSiteDateTime(startDate, { hour: "2-digit", minute: "2-digit" })}{endDate && ` - ${formatSiteDateTime(endDate, { hour: "2-digit", minute: "2-digit" })}`}</span></p>
                  <p className="flex items-center gap-3"><MapPin className="h-6 w-6 shrink-0 text-green-400" /><span className="break-words">{event.location}</span></p>
                  {event.attendees_text && <p className="flex items-center gap-3"><Users className="h-6 w-6 shrink-0 text-green-400" /><span>{event.attendees_text}</span></p>}
                </div>
                {event.description && <div className="prose prose-sm mb-4 max-w-none text-lg text-gray-400 prose-invert"><MarkdownRenderer content={event.description} /></div>}
                {isToday && <div className="absolute right-4 top-4 rounded-full bg-green-500 px-3 py-1 text-sm font-bold text-white">ДНЕС!</div>}
              </article>
            );
          })}
        </div>
      ) : <p className="text-center text-3xl text-gray-300 md:text-5xl">Все още няма предстоящи събития.</p>}
    </SectionShell>
  );
}
