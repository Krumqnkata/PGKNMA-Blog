import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import { SiteArt, type SiteArtName } from "@/components/art/SiteArt";

interface Benefit {
  title: string;
  description: string;
  href: string;
  action: string;
  art: SiteArtName;
  accent: string;
}

const BENEFITS: Benefit[] = [
  {
    title: "Важното, веднага",
    description: "Официални новини, успехи и възможности — подредени ясно, без да губиш време в търсене.",
    href: "/news",
    action: "Отвори новините",
    art: "newspaper",
    accent: "from-sky-500/25 via-cyan-500/10 to-transparent",
  },
  {
    title: "Планирай с увереност",
    description: "Виж предстоящите събития и важните дати навреме, за да знаеш какво следва.",
    href: "/events",
    action: "Виж календара",
    art: "calendar",
    accent: "from-violet-500/25 via-fuchsia-500/10 to-transparent",
  },
  {
    title: "Участвай, не само чети",
    description: "Гласувай, предлагай идеи и бъди активна част от решенията и настроението в училище.",
    href: "/weekly-poll",
    action: "Включи се сега",
    art: "poll",
    accent: "from-amber-500/25 via-orange-500/10 to-transparent",
  },
];

export default function HomeBenefits() {
  return (
    <section
      id="home-benefits"
      className="relative isolate overflow-hidden border-b border-border/70 py-16 sm:py-20 lg:py-24"
      aria-labelledby="home-benefits-title"
    >
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-background via-muted/25 to-background" />
      <div className="absolute left-1/2 top-1/3 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
            Създадено за твоя ден
          </p>
          <h2 id="home-benefits-title" className="mt-3 text-balance text-3xl font-black tracking-[-0.04em] sm:text-5xl">
            Един портал. Три начина да си една крачка напред.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            По-малко търсене, повече яснота и реално участие в училищния живот.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-14 lg:gap-7">
          {BENEFITS.map(({ title, description, href, action, art, accent }, index) => (
            <Link
              key={title}
              to={href}
              className="home-stagger-item group relative flex min-h-80 flex-col overflow-hidden rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-md transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-2 hover:border-primary/45 hover:shadow-2xl hover:shadow-primary/10 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 sm:p-7"
              style={{ "--home-stagger-index": index } as CSSProperties}
            >
              <div className={`absolute inset-x-0 top-0 h-40 bg-gradient-to-br ${accent} opacity-75 transition-opacity duration-300 group-hover:opacity-100`} aria-hidden="true" />
              <SiteArt name={art} className="relative block h-16 w-16 drop-shadow-sm" />

              <div className="relative mt-8 flex flex-1 flex-col">
                <h3 className="text-2xl font-black leading-tight tracking-tight">{title}</h3>
                <p className="mt-4 flex-1 text-base leading-relaxed text-muted-foreground">
                  {description}
                </p>
                <span className="mt-7 inline-flex items-center gap-2 font-black text-primary">
                  {action}
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </div>

              <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-primary to-sky-500 transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
