import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Trophy } from "lucide-react";

import { useSettings } from "@/hooks/use-settings";
import { getMemeWinner } from "@/lib/api";
import { formatMemeWeek } from "@/lib/meme-weeks";

/** Home page card with last week's „Меме на седмицата“. Hidden until there is a winner. */
const HomeMemeWinner = () => {
  const { settings } = useSettings();
  const enabled = settings?.enable_meme_of_the_week !== false;
  const { data: winner } = useQuery({
    queryKey: ["memes", "winner"],
    queryFn: getMemeWinner,
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  if (!enabled || !winner) return null;

  return (
    <section aria-labelledby="home-meme-winner-heading" className="container mx-auto px-4 py-12 sm:py-16">
      <Link
        to="/meme-of-the-week"
        className="group mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-amber-400/50 bg-gradient-to-br from-amber-100/70 via-card to-card shadow-xl transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hover:translate-y-0 dark:from-amber-500/10 sm:grid-cols-[minmax(0,16rem)_1fr]"
      >
        <img
          src={winner.winner.image_url}
          alt={winner.winner.title}
          loading="lazy"
          className="aspect-square h-full w-full object-cover"
        />
        <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
            <Trophy className="h-4 w-4" aria-hidden="true" /> Меме на седмицата
          </p>
          <h2 id="home-meme-winner-heading" className="text-2xl font-black leading-tight sm:text-3xl">
            {winner.winner.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {formatMemeWeek(winner.week_start)}
            {winner.winner.user_username ? <> · от {winner.winner.user_username}</> : null}
          </p>
          <p className="inline-flex items-center gap-2 text-sm font-semibold">
            <Heart className="h-4 w-4 text-rose-500" aria-hidden="true" /> {winner.winner_votes} гласа
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
            Гласувай за мемето на тази седмица
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </section>
  );
};

export default HomeMemeWinner;
