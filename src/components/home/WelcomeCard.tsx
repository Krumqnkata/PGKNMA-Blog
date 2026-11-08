import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { SiteArt, type SiteArtName } from "@/components/art/SiteArt";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { clearWelcome, isWelcomePending } from "@/lib/welcome";

const FIRST_STEPS: { to: string; label: string; hint: string; art: SiteArtName }[] = [
  { to: "/bell-suggest", label: "Предложи песен", hint: "за училищния звънец", art: "bell" },
  { to: "/games", label: "Изиграй игра", hint: "и събери първите си точки", art: "gamepad" },
  { to: "/weekly-poll", label: "Реши задачата на седмицата", hint: "и сравни се с другите", art: "poll" },
];

/** Shown once on the home page after someone registers in this browser (see lib/welcome.ts). */
export default function WelcomeCard() {
  const { user } = useAuth();
  const [pending, setPending] = useState(isWelcomePending);

  if (!user || !pending) return null;

  const dismiss = () => {
    clearWelcome();
    setPending(false);
  };

  return (
    <section aria-labelledby="home-welcome-title" className="border-b border-border/70 bg-gradient-to-b from-primary/10 to-background py-8 sm:py-10">
      <div className="container mx-auto px-4">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-primary/25 bg-card/90 p-5 shadow-lg sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
            <SiteArt name="rocket" className="art-pop h-16 w-16 sm:h-20 sm:w-20" />
            <div className="min-w-0 flex-1">
              <h2 id="home-welcome-title" className="text-2xl font-black tracking-tight [overflow-wrap:anywhere] sm:text-3xl">
                Добре дошли в блога, <span className="text-primary">{user.username}</span>!
              </h2>
              <p className="mt-2 text-pretty text-muted-foreground">
                Профилът ти е готов. Ето три неща, с които да започнеш:
              </p>
            </div>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {FIRST_STEPS.map((step) => (
              <li key={step.to}>
                <Link
                  to={step.to}
                  onClick={dismiss}
                  className="group flex h-full items-center gap-3 rounded-2xl border border-border/80 bg-background/70 p-3 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hover:translate-y-0"
                >
                  <SiteArt name={step.art} className="h-11 w-11" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold leading-tight">{step.label}</span>
                    <span className="block text-sm text-muted-foreground">{step.hint}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex justify-center sm:justify-end">
            <Button type="button" variant="ghost" onClick={dismiss}>Разбрах</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
