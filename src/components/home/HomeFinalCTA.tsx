import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

const CTA_SIGNALS = ["Без регистрация", "Работи на всяко устройство", "Винаги актуално"];

export default function HomeFinalCTA() {
  return (
    <section
      id="home-final-cta"
      className="relative isolate overflow-hidden bg-slate-950 py-20 text-white sm:py-24 lg:py-28"
      aria-labelledby="home-final-cta-title"
    >
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_10%_10%,hsl(var(--primary)/0.5),transparent_32%),radial-gradient(circle_at_90%_80%,rgb(59_130_246/0.3),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_48%,#020617_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.06)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      <div className="absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />

      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-4xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-teal-200 backdrop-blur">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Не изпускай следващото важно нещо
          </p>

          <h2 id="home-final-cta-title" className="mt-6 text-balance text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-5xl lg:text-7xl">
            Готов ли си да бъдеш в ритъма на училището?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-300 sm:text-xl">
            Открий последните новини, важните дати и възможностите,
            които си струва да не пропускаш.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group h-16 w-full rounded-2xl bg-white px-9 text-lg font-black text-slate-950 shadow-2xl shadow-cyan-500/20 hover:bg-teal-50 sm:w-auto"
            >
              <Link to="/news">
                Отвори последните новини
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </Button>
            <Link
              to="/contact"
              className="inline-flex h-14 items-center justify-center rounded-2xl px-6 font-bold text-white underline decoration-white/30 underline-offset-8 transition-colors hover:text-teal-200 hover:decoration-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950"
            >
              Имаш идея? Свържи се с нас
            </Link>
          </div>

          <ul className="mt-9 flex flex-col items-center justify-center gap-3 text-sm font-semibold text-slate-300 sm:flex-row sm:gap-6">
            {CTA_SIGNALS.map((signal) => (
              <li key={signal} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-300" aria-hidden="true" />
                {signal}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
