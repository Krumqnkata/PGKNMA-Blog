import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronDown, Heart, History, Timer, Trophy, UploadCloud } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { SuccessMoment } from '@/components/art/SuccessMoment';
import { QueryEmptyState } from '@/components/query/QueryStates';
import { InteriorPage, InteriorPageHero, InteriorSection, SectionHeading } from '@/components/InteriorPage';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { useGoToLogin } from '@/hooks/use-go-to-login';
import { getMemes, getMemeWeeks, getMemeWinner, submitMeme, voteForMeme } from '@/lib/api';
import type { Meme, MemeWeekSummary } from '@/lib/api';
import { formatMemeWeek, votingDeadlineText } from '@/lib/meme-weeks';
import { publicProfilePath } from '@/lib/public-profile';
import { formatSiteDate } from '@/lib/date-time';
import { cn } from '@/lib/utils';

const Author = ({ username }: { username: string | null | undefined }) => (
  username
    ? <Link className="font-medium hover:text-primary hover:underline" to={publicProfilePath(username)}>{username}</Link>
    : <>изтрит потребител</>
);

interface MemeCardProps {
  meme: Meme;
  canVote: boolean;
  onVote?: (memeId: number) => void;
  isWinner?: boolean;
}

const MemeCard = ({ meme, canVote, onVote, isWinner = false }: MemeCardProps) => (
  <Card className={cn(
    "group overflow-hidden transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl motion-reduce:hover:translate-y-0",
    isWinner && "border-amber-400/70 ring-2 ring-amber-400/40",
  )}>
    <CardContent className="relative p-0">
      {isWinner && (
        <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-950 shadow">
          <Trophy className="h-3.5 w-3.5" aria-hidden="true" /> Победител
        </span>
      )}
      <div className="aspect-square overflow-hidden bg-muted">
        <img src={meme.image_url} alt={meme.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100" />
      </div>
    </CardContent>
    <div className="p-5">
      <CardTitle className="text-lg">{meme.title}</CardTitle>
      <CardDescription>Качено от: <Author username={meme.user_username} /> на {formatSiteDate(meme.created_at)}</CardDescription>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Heart className="h-4 w-4 text-rose-500" aria-hidden="true" />
          <span className="text-lg font-black text-foreground">{meme.votes}</span>
          <span>гласа</span>
        </div>
        {canVote && onVote ? (
          <Button
            onClick={() => onVote(meme.id)}
            disabled={meme.has_voted}
            variant={meme.has_voted ? "secondary" : "default"}
          >
            {meme.has_voted ? "Гласувано" : "Гласувай"}
          </Button>
        ) : null}
      </div>
    </div>
  </Card>
);

const MemeGridSkeleton = () => (
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {[...Array(3)].map((_, i) => (
      <Card key={i}>
        <Skeleton className="aspect-square w-full rounded-t-2xl" />
        <div className="space-y-2 p-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Card>
    ))}
  </div>
);

/** One closed week in the archive. Its memes load only when it is opened. */
const ArchivedWeek = ({ week }: { week: MemeWeekSummary }) => {
  const [open, setOpen] = useState(false);
  const memesQuery = useQuery({
    queryKey: ['memes', 'week', week.week_start],
    queryFn: () => getMemes(week.week_start),
    enabled: open,
    staleTime: 10 * 60 * 1000,
  });
  const contentId = `meme-week-${week.week_start}`;

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        {week.winner ? (
          <img src={week.winner.image_url} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" loading="lazy" />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"><History className="h-5 w-5" aria-hidden="true" /></span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-muted-foreground">{formatMemeWeek(week.week_start)}</span>
          <span className="block truncate font-bold">
            {week.winner ? <>🏆 {week.winner.title}</> : 'Без победител'}
          </span>
          <span className="block text-xs text-muted-foreground">
            {week.winner ? `${week.winner_votes} гласа · ` : ''}{week.meme_count} {week.meme_count === 1 ? 'меме' : 'мемета'}
          </span>
        </span>
        <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform motion-reduce:transition-none", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && (
        <div id={contentId} className="border-t border-border/60 p-4">
          {memesQuery.isLoading ? <MemeGridSkeleton /> : memesQuery.isError ? (
            <p className="text-sm text-destructive">Не успяхме да заредим меметата от тази седмица.</p>
          ) : (memesQuery.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Меметата от тази седмица вече са премахнати.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(memesQuery.data ?? []).map((meme) => (
                <MemeCard key={meme.id} meme={meme} canVote={false} isWinner={meme.id === week.winner?.id} />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

const MemeOfTheWeek: React.FC = () => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [memeSent, setMemeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [olderWeeks, setOlderWeeks] = useState<MemeWeekSummary[]>([]);
  const [hasMoreOlder, setHasMoreOlder] = useState<boolean | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const goToLogin = useGoToLogin();

  const winnerQuery = useQuery({ queryKey: ['memes', 'winner'], queryFn: getMemeWinner, staleTime: 5 * 60 * 1000 });
  const weeksQuery = useQuery({ queryKey: ['memes', 'weeks'], queryFn: () => getMemeWeeks(), staleTime: 5 * 60 * 1000 });
  const archive = [...(weeksQuery.data?.results ?? []), ...olderWeeks];
  const showMoreButton = hasMoreOlder ?? weeksQuery.data?.has_more ?? false;

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        setIsLoading(true);
        const fetchedMemes = await getMemes();
        setMemes(Array.isArray(fetchedMemes) ? fetchedMemes : []);
        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Неуспешно зареждане на меметата.';
        setError(errorMessage);
        console.error(err);
        toast({
          title: "Грешка при зареждане",
          description: errorMessage || "Не успяхме да заредим меметата. Моля, опреснете страницата.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemes();
  }, [toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      toast({ title: "Липсва картинка", description: "Избери файл с мемето, преди да го изпратиш.", variant: "destructive" });
      return;
    }
    if (!isAuthenticated) {
      toast({ title: "Не сте влезли", description: "Моля, влезте, за да качвате мемета.", variant: "destructive" });
      goToLogin();
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMeme({ title, image: selectedFile });
      setMemeSent(true);
      setTitle("");
      setSelectedFile(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Неуспешно изпращане. Моля, опитайте отново.";
      toast({
        title: "Грешка при качване",
        description: errorMessage,
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (memeId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Необходим е вход",
        description: "Моля, влезте в профила си, за да гласувате.",
        variant: "destructive",
      });
      goToLogin();
      return;
    }

    try {
      const updatedMeme = await voteForMeme(memeId);
      setMemes(currentMemes =>
        currentMemes.map(meme =>
          meme.id === memeId ? updatedMeme : meme
        )
      );
      toast({
        title: "Успешен глас!",
        description: "Вашият глас беше отчетен.",
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Вече сте гласували за това меме или възникна друга грешка.";
      toast({
        title: "Грешка при гласуване",
        description: errorMessage,
        variant: "destructive",
      });
      console.error(err);
    }
  };

  const loadOlderWeeks = async () => {
    const last = archive[archive.length - 1];
    if (!last) return;
    setIsLoadingMore(true);
    try {
      const page = await getMemeWeeks(last.week_start);
      setOlderWeeks((current) => [...current, ...page.results]);
      setHasMoreOlder(page.has_more);
    } catch (err: unknown) {
      toast({
        title: "Грешка при зареждане",
        description: err instanceof Error ? err.message : "Не успяхме да заредим още седмици.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const winner = winnerQuery.data;

  return (
    <InteriorPage>
      <InteriorPageHero eyebrow="Забавната страна на училището" title={<>Меме на <span className="text-primary">седмицата</span></>} description="Всяка седмица от понеделник до неделя общността гласува, а мемето с най-много гласове става „Меме на седмицата“." art="meme" />
      <InteriorSection>

          {winner && (
            <section aria-labelledby="meme-winner-heading" className="mx-auto mb-12 max-w-3xl overflow-hidden rounded-3xl border border-amber-400/50 bg-gradient-to-br from-amber-100/70 via-card to-card shadow-xl dark:from-amber-500/10">
              <div className="grid gap-0 sm:grid-cols-[minmax(0,15rem)_1fr]">
                <img src={winner.winner.image_url} alt={winner.winner.title} className="aspect-square h-full w-full object-cover" />
                <div className="flex flex-col justify-center gap-2 p-6">
                  <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                    <Trophy className="h-4 w-4" aria-hidden="true" /> Меме на миналата седмица
                  </p>
                  <h2 id="meme-winner-heading" className="text-2xl font-black leading-tight">{winner.winner.title}</h2>
                  <p className="text-sm text-muted-foreground">{formatMemeWeek(winner.week_start)}</p>
                  <p className="text-sm">От <Author username={winner.winner.user_username} /> · <span className="font-bold">{winner.winner_votes} гласа</span></p>
                </div>
              </div>
            </section>
          )}

          {isAuthenticated && memeSent ? (
            <SuccessMoment art="meme" title="Мемето ти е на път!" actionLabel="Качи още едно меме" onAction={() => setMemeSent(false)} className="mb-12">
              Екипът ще го прегледа и след одобрение то ще участва в седмицата, в която бъде одобрено.
            </SuccessMoment>
          ) : isAuthenticated ? (
            <Card className="mx-auto mb-12 max-w-2xl overflow-hidden shadow-xl shadow-primary/5">
              <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary/10 to-transparent">
                <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><UploadCloud className="h-5 w-5" aria-hidden="true" /></div>
                <CardTitle>Качи твоето меме</CardTitle>
                <CardDescription>Попълни формата, за да изпратиш меме за одобрение. Новото меме участва в седмицата, в която бъде одобрено.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Заглавие на мемето</Label>
                    <Input id="title" type="text" placeholder="Например: Когато учителят по математика..." value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meme-file">Файл с меме</Label>
                    <Input id="meme-file" type="file" accept="image/*" onChange={handleFileChange} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Изпращане...' : 'Изпрати за одобрение'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="mx-auto mb-12 max-w-2xl p-7 text-center shadow-lg">
                <CardTitle className="mb-4">Влезте, за да качите меме</CardTitle>
                <CardDescription className="mb-6">
                    За да участвате в състезанието "Меме на седмицата" и да качвате свои мемета, моля, влезте в системата.
                </CardDescription>
                <Button onClick={goToLogin} className="w-full">Вход</Button>
            </Card>
          )}

          <div>
            <SectionHeading eyebrow="Общността избира" title="Тази седмица" description="Разгледайте одобрените предложения и гласувайте за своя фаворит." />
            <p className="-mt-2 mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
              <Timer className="h-4 w-4 text-primary" aria-hidden="true" />
              {votingDeadlineText(weeksQuery.data?.voting_ends_at)}
            </p>
            {isLoading ? <MemeGridSkeleton /> : error ? (
                <p className="text-center text-destructive mt-8">{error}</p>
            ) : (
              <>
                {memes.length === 0 ? (
                  <QueryEmptyState art="meme" title="Тази седмица все още няма одобрени мемета" description="Бъди първият, който ще разсмее цялото училище!" />
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {memes.map((meme) => (
                      <MemeCard
                        key={meme.id}
                        meme={meme}
                        canVote={meme.is_current_week !== false}
                        onVote={handleVote}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {archive.length > 0 && (
            <div className="mt-16">
              <SectionHeading eyebrow="Архив" title="Минали седмици" description="Победителите и всички мемета от изминалите седмици. За тях вече не се гласува." />
              <div className="space-y-3">
                {archive.map((week) => <ArchivedWeek key={week.week_start} week={week} />)}
              </div>
              {showMoreButton && (
                <div className="mt-6 text-center">
                  <Button variant="outline" onClick={loadOlderWeeks} disabled={isLoadingMore}>
                    {isLoadingMore ? 'Зареждане…' : 'Покажи още седмици'}
                  </Button>
                </div>
              )}
            </div>
          )}
      </InteriorSection>
    </InteriorPage>
  );
};

export default MemeOfTheWeek;
