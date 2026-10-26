import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Play,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import { PageEyebrow } from "@/components/InteriorPage";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/hooks/use-accessibility";

const HERO_SIGNALS = [
  "Актуални новини",
  "Важни дати",
  "Гласът на общността",
];

const VIDEO_RETRY_DELAYS = [1_000, 3_000, 8_000];

export default function Hero() {
  const { reduceMotion } = useAccessibility();
  const [videoAttempt, setVideoAttempt] = useState(0);
  const [videoLoadFailed, setVideoLoadFailed] = useState(false);
  const [videoPlaybackBlocked, setVideoPlaybackBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRetryCountRef = useRef(0);
  const videoRetryTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (reduceMotion) {
      if (!video.paused) video.pause();
      return;
    }

    let active = true;
    void video.play()
      .then(() => {
        if (active) setVideoPlaybackBlocked(false);
      })
      .catch(() => {
        if (active) setVideoPlaybackBlocked(true);
      });
    return () => {
      active = false;
    };
  }, [reduceMotion, videoAttempt]);

  useEffect(() => () => {
    if (videoRetryTimerRef.current !== null) {
      window.clearTimeout(videoRetryTimerRef.current);
    }
  }, []);

  const retryVideo = () => {
    if (videoRetryTimerRef.current !== null) return;
    setVideoPlaybackBlocked(false);
    const retryIndex = videoRetryCountRef.current;
    if (retryIndex >= VIDEO_RETRY_DELAYS.length) {
      setVideoLoadFailed(true);
      return;
    }

    videoRetryCountRef.current += 1;
    videoRetryTimerRef.current = window.setTimeout(() => {
      videoRetryTimerRef.current = null;
      setVideoLoadFailed(false);
      setVideoAttempt((current) => current + 1);
    }, VIDEO_RETRY_DELAYS[retryIndex]);
  };

  const confirmVideoAvailable = () => {
    videoRetryCountRef.current = 0;
    setVideoLoadFailed(false);
    if (videoRetryTimerRef.current !== null) {
      window.clearTimeout(videoRetryTimerRef.current);
      videoRetryTimerRef.current = null;
    }
    if (!reduceMotion) {
      void videoRef.current?.play()
        .then(() => setVideoPlaybackBlocked(false))
        .catch(() => setVideoPlaybackBlocked(true));
    } else {
      const video = videoRef.current;
      if (video && !video.paused) video.pause();
    }
  };

  const playVideoManually = () => {
    void videoRef.current?.play()
      .then(() => setVideoPlaybackBlocked(false))
      .catch(() => setVideoPlaybackBlocked(true));
  };

  const retryVideoManually = () => {
    if (videoRetryTimerRef.current !== null) {
      window.clearTimeout(videoRetryTimerRef.current);
      videoRetryTimerRef.current = null;
    }
    videoRetryCountRef.current = 0;
    setVideoLoadFailed(false);
    setVideoPlaybackBlocked(false);
    setVideoAttempt((current) => current + 1);
  };

  const videoSource = videoAttempt === 0
    ? "/front-page-loop.webm"
    : `/front-page-loop.webm?retry=${videoAttempt}`;

  return (
    <section
      id="home-hero"
      className="relative isolate overflow-hidden border-b border-border/70 bg-background"
      aria-labelledby="home-hero-title"
    >
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_10%_5%,hsl(var(--primary)/0.24),transparent_31%),radial-gradient(circle_at_86%_18%,hsl(213_94%_58%/0.18),transparent_32%),linear-gradient(145deg,hsl(var(--background))_0%,hsl(var(--background))_48%,hsl(var(--muted)/0.55)_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,hsl(var(--border)/0.22)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.22)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
      <div className="absolute -left-32 top-1/3 -z-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />

      <div className="container mx-auto grid items-center gap-8 px-4 py-10 sm:gap-12 sm:py-14 lg:grid-cols-12 lg:gap-16 lg:py-16">
        <div className="relative z-10 text-center lg:col-span-7 lg:text-left">
          <PageEyebrow icon={Sparkles} className="home-hero-enter">
            Официалният дигитален портал на ПГКНМА
          </PageEyebrow>

          <h1
            id="home-hero-title"
            className="home-hero-enter home-hero-enter-delay-1 mt-4 text-balance text-[clamp(2.25rem,7vw,5rem)] font-black lg:text-[clamp(2.75rem,4.6vw,5rem)] leading-[1] tracking-[-0.05em] sm:mt-6"
          >
            Не просто следвай училищния живот.{" "}
            <span className="mt-2 block bg-gradient-to-r from-primary via-teal-500 to-sky-500 bg-clip-text pb-2 text-transparent">
              Бъди част от него.
            </span>
          </h1>

          <p className="home-hero-enter home-hero-enter-delay-2 mx-auto mt-5 max-w-2xl text-pretty text-base font-medium leading-relaxed text-muted-foreground sm:mt-6 sm:text-xl lg:mx-0 lg:text-2xl">
            Новини, събития и възможности от ПГКНМА — поднесени ясно,
            навреме и на едно място.
          </p>

          <div className="home-hero-enter home-hero-enter-delay-3 mt-7 flex flex-col items-stretch justify-center gap-3 sm:mt-9 sm:flex-row sm:items-center sm:gap-4 lg:justify-start">
            <Button
              asChild
              size="lg"
              className="home-primary-cta group h-14 rounded-2xl bg-gradient-to-r from-primary via-teal-500 to-sky-500 px-8 text-lg font-black text-white shadow-2xl shadow-primary/30 hover:brightness-110 sm:h-16 sm:px-10"
            >
              <Link to="/news">
                Виж какво е новото
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </Button>

            <Link
              to="/events"
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card/75 px-6 text-base font-bold shadow-sm backdrop-blur-md transition-[transform,box-shadow,border-color,background-color] duration-300 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-card hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
              Провери календара
            </Link>
          </div>

          <ul className="home-hero-enter home-hero-enter-delay-4 mx-auto mt-6 hidden sm:mt-8 sm:flex max-w-2xl flex-wrap justify-center gap-x-5 gap-y-3 text-sm font-semibold text-muted-foreground lg:mx-0 lg:justify-start">
            {HERO_SIGNALS.map((signal) => (
              <li key={signal} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                {signal}
              </li>
            ))}
          </ul>
        </div>

        <div className="home-hero-visual relative mx-auto w-full max-w-xl lg:col-span-5">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/30 via-sky-500/10 to-violet-500/20 blur-3xl" aria-hidden="true" />

          <div className="relative aspect-video overflow-hidden rounded-[1.5rem] border border-white/15 bg-slate-950 shadow-2xl shadow-slate-950/25 sm:aspect-[4/3] sm:rounded-[2rem] lg:aspect-square">
            <video
              key={videoAttempt}
              ref={videoRef}
              autoPlay={!reduceMotion}
              loop
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
              aria-hidden="true"
              tabIndex={-1}
              onCanPlay={confirmVideoAvailable}
              onError={retryVideo}
              onPlaying={() => setVideoPlaybackBlocked(false)}
            >
              <source src={videoSource} type="video/webm" />
            </video>

            {(videoLoadFailed || (!reduceMotion && videoPlaybackBlocked)) && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95 px-5 text-slate-950 shadow-xl hover:bg-white"
                onClick={videoLoadFailed ? retryVideoManually : playVideoManually}
              >
                {videoLoadFailed
                  ? <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  : <Play className="h-4 w-4" aria-hidden="true" />}
                {videoLoadFailed
                  ? reduceMotion
                    ? "Зареди кадъра отново"
                    : "Опитай видеото отново"
                  : "Пусни видеото"}
              </Button>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/5" aria-hidden="true" />

            <div className="absolute left-4 top-4 hidden rounded-full border border-white/20 bg-slate-950/55 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-white shadow-lg backdrop-blur-md sm:left-5 sm:top-5 sm:block">
              Официалният блог
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-7 lg:p-8">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.24em] text-teal-200 sm:text-sm">
                Твоето училище. Твоят ритъм.
              </p>
              <p className="mt-1.5 max-w-md text-xl font-black leading-tight tracking-tight sm:mt-3 sm:text-3xl lg:text-4xl">
                Важното започва оттук.
              </p>

              <div className="mt-5 hidden grid-cols-3 gap-2 border-t border-white/20 pt-5 text-center text-[0.68rem] font-bold text-white/80 sm:grid sm:gap-3 sm:text-xs">
                <span>Новини</span>
                <span>Календар</span>
                <span>Общност</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#home-news"
        aria-label="Към последните новини"
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 rounded-full border border-border/80 bg-background/80 p-2.5 text-muted-foreground shadow-md backdrop-blur transition-[transform,color,box-shadow] hover:-translate-y-1 hover:text-primary hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:block"
      >
        <ArrowDown className="h-5 w-5 motion-safe:animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
