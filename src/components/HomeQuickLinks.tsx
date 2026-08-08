import { ArrowUpRight, CalendarDays, CircleHelp, Clock3, Music2, Newspaper, Vote } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: string;
}

const QUICK_LINKS: QuickLink[] = [
  { title: "Последни новини", description: "Важното от училищния живот на едно място.", href: "/news", icon: Newspaper, accent: "from-blue-500/20 to-cyan-500/5 text-blue-600 dark:text-blue-300" },
  { title: "Училищен календар", description: "Събития, инициативи и важни дати.", href: "/events", icon: CalendarDays, accent: "from-emerald-500/20 to-teal-500/5 text-emerald-700 dark:text-emerald-300" },
  { title: "Учебна програма", description: "Бърза проверка на часовете за вашия клас.", href: "/program", icon: Clock3, accent: "from-violet-500/20 to-purple-500/5 text-violet-700 dark:text-violet-300" },
  { title: "Предложи песен", description: "Участвай в избора на музика за училищния звънец.", href: "/bell-suggest", icon: Music2, accent: "from-rose-500/20 to-pink-500/5 text-rose-700 dark:text-rose-300" },
  { title: "Седмична анкета", description: "Провери знанията си и виж класацията.", href: "/weekly-poll", icon: Vote, accent: "from-amber-500/20 to-orange-500/5 text-amber-700 dark:text-amber-300" },
  { title: "Помощ и въпроси", description: "Намери бърз отговор или се свържи с нас.", href: "/faq", icon: CircleHelp, accent: "from-sky-500/20 to-indigo-500/5 text-sky-700 dark:text-sky-300" },
];

export default function HomeQuickLinks() {
  return (
    <section id="home-highlights" aria-labelledby="home-highlights-title" className="border-b bg-gradient-to-b from-background to-muted/30 py-14 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-9 max-w-3xl text-center sm:mb-12">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">Открий бързо</p>
          <h2 id="home-highlights-title" className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">Всичко важно е на един клик</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">Ясни преки пътища към най-използваните услуги и съдържание в училищния портал.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map(({ title, description, href, icon: Icon, accent }) => (
            <Link key={href} to={href} className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-6">
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent}`}><Icon className="h-6 w-6" aria-hidden="true" /></div>
              <h3 className="flex items-center justify-between gap-3 text-xl font-bold">{title}<ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" /></h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{description}</p>
              <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
