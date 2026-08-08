import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, CalendarDays, Mail, Newspaper, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/hooks/use-accessibility";

const PHRASES = ["новините", "събитията", "идеите", "училищната общност"];

export default function Hero() {
  const { reduceMotion } = useAccessibility();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (reduceMotion) return;
    const interval = window.setInterval(() => setPhraseIndex((current) => (current + 1) % PHRASES.length), 3_500);
    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduceMotion) video.pause();
    else void video.play().catch(() => undefined);
  }, [reduceMotion]);

  return (
    <section className="relative isolate overflow-hidden border-b bg-background" aria-labelledby="home-hero-title">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_10%,hsl(var(--primary)/0.18),transparent_32%),radial-gradient(circle_at_90%_70%,hsl(var(--accent)/0.12),transparent_35%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/0.25)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.25)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

      <div className="container mx-auto grid min-h-[calc(100svh-4rem)] items-center gap-12 px-4 py-14 lg:grid-cols-12 lg:py-20">
        <div className="text-center lg:col-span-7 lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" aria-hidden="true" />Официалният ученически портал на ПГКНМА
          </div>
          <h1 id="home-hero-title" className="mt-6 text-balance text-4xl font-black leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-7xl xl:text-8xl">
            Училищният живот,
            <span className="block bg-gradient-to-r from-primary via-teal-500 to-blue-500 bg-clip-text text-transparent">ясен и близо до теб.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0">
            Следи <span key={phraseIndex} className="font-semibold text-foreground motion-safe:animate-in motion-safe:fade-in">{reduceMotion ? "важното" : PHRASES[phraseIndex]}</span>, откривай възможности и участвай активно в общността на гимназията.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Button size="lg" asChild className="h-12 rounded-xl px-7 text-base shadow-lg shadow-primary/20">
              <Link to="/news"><Newspaper className="h-5 w-5" />Последни новини<ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 rounded-xl bg-background/70 px-7 text-base backdrop-blur">
              <Link to="/events"><CalendarDays className="h-5 w-5" />Виж календара</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild className="h-12 rounded-xl px-5 text-base">
              <Link to="/contact"><Mail className="h-5 w-5" />Контакти</Link>
            </Button>
          </div>

          <dl className="mx-auto mt-10 grid max-w-xl grid-cols-3 divide-x rounded-2xl border bg-card/70 p-4 text-center shadow-sm backdrop-blur lg:mx-0">
            <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Достъп</dt><dd className="mt-1 text-lg font-black sm:text-2xl">24/7</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Общност</dt><dd className="mt-1 text-lg font-black sm:text-2xl">450+</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">На едно място</dt><dd className="mt-1 text-lg font-black sm:text-2xl">Всичко</dd></div>
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:col-span-5">
          <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/25 via-transparent to-blue-500/20 blur-2xl" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border bg-card shadow-2xl sm:aspect-square lg:aspect-[4/5]">
            <video ref={videoRef} src="/front-page-loop.webm" autoPlay={!reduceMotion} loop muted playsInline preload="metadata" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/5 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-200">Заедно създаваме</p>
              <p className="mt-2 text-2xl font-black leading-tight sm:text-4xl">Място за знания, идеи и бъдеще.</p>
            </div>
            <div className="absolute right-4 top-4 rounded-2xl border border-white/20 bg-slate-950/55 px-4 py-3 text-white shadow-lg backdrop-blur-md">
              <p className="text-xs uppercase tracking-wider text-white/70">Актуално</p><p className="mt-1 font-bold">Всеки учебен ден</p>
            </div>
          </div>
        </div>
      </div>

      <a href="#home-highlights" aria-label="Към бързите връзки" className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 rounded-full border bg-background/80 p-2 text-muted-foreground shadow-sm backdrop-blur transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:block">
        <ArrowDown className="h-5 w-5 motion-safe:animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
