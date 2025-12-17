import { useCallback, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import CookieConsent from "@/components/CookieConsent";
import { getWeeklyPollStatus, submitWeeklyPollAnswer, PollQuestion, PollOption } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { PollStatistics } from "@/components/PollStatistics";

type AnswerKey = "a" | "b" | "c" | "d";

const WeeklyPollContent = () => {
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: pollStatus, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["weeklyPollStatus"],
    queryKeyHash: 'weeklyPollStatus',
    queryFn: getWeeklyPollStatus,
    staleTime: Infinity, // The poll status is stable for the week
  });

  const { mutate: submitAnswer, isPending: isSubmitting } = useMutation({
    mutationFn: ({ questionId, optionId }: { questionId: number, optionId: number }) =>
      submitWeeklyPollAnswer(questionId, optionId),
    onSuccess: (data) => {
      queryClient.setQueryData(["weeklyPollStatus"], data);
      const isCorrect = data.last_result?.selected === data.last_result?.correct;
      toast({
        title: isCorrect ? "Браво!" : "Опитай пак",
        description: isCorrect
          ? "Отговорът е верен."
          : `Верен е вариант ${data.last_result?.correct?.toUpperCase()}.`,
        variant: isCorrect ? "default" : "destructive",
      });
    },
    onError: (err) => {
      toast({
        title: "Грешка при изпращане",
        description: err.message || "Възникна грешка при записа на вашия отговор.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = useCallback(() => {
    if (!selectedOptionId || !pollStatus?.question?.id) {
      toast({ title: "Изберете отговор", description: "Моля, маркирайте един от вариантите." });
      return;
    }
    submitAnswer({ questionId: pollStatus.question.id, optionId: selectedOptionId });
  }, [selectedOptionId, pollStatus?.question?.id, submitAnswer]);

  const currentQuestion = pollStatus?.question;
  const isLocked = pollStatus?.is_locked ?? false;
  const lastResult = pollStatus?.last_result;

  const codeLines = useMemo(() => currentQuestion?.code?.split("\n") ?? [], [currentQuestion]);
  const unlockLabel = useMemo(() => {
    if (!pollStatus?.unlocks_at) return "неделя, 23:59";
    return new Date(pollStatus.unlocks_at).toLocaleString("bg-BG", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [pollStatus?.unlocks_at]);

  const getOptionStyles = useCallback(
    (opt: PollOption) => {
      const base = "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors";
      if (!lastResult || lastResult.questionId !== currentQuestion?.id) {
        return `${base} border-border hover:bg-muted/50`;
      }
      const isSelected = lastResult.selected === opt.key;
      const isCorrect = lastResult.correct === opt.key;
      if (isSelected && isCorrect) return `${base} border-emerald-400 bg-emerald-100 text-emerald-900`;
      if (isSelected && !isCorrect) return `${base} border-red-400 bg-red-100 text-red-900`;
      if (!isSelected && isCorrect) return `${base} border-emerald-300 bg-emerald-50 text-emerald-900`;
      return `${base} border-border hover:bg-muted/50`;
    },
    [currentQuestion?.id, lastResult]
  );
  
  if (isLoading) {
    return <div className="text-center">Зареждане на анкетата...</div>;
  }

  if (isError) {
    return (
      <div className="text-center text-red-500">
        <p>Грешка при зареждане на анкетата: {error.message}</p>
        <p>Моля, влезте в профила си, за да участвате.</p>
        <Button onClick={() => refetch()} className="mt-4">Опитай отново</Button>
      </div>
    );
  }

  if (!currentQuestion) {
     return <div className="text-center">Няма активни анкети в момента.</div>;
  }

  return (
    <Card className="mx-auto max-w-3xl border-border bg-card/90 shadow-lg">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-2xl">{currentQuestion.title}</CardTitle>
          <CardDescription>{currentQuestion.subtitle}</CardDescription>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="shrink-0" disabled={isSubmitting || isLoading}>
          Опресни
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLocked ? (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <Badge variant="secondary" className="bg-amber-200 text-amber-900">Заключено</Badge>
            <div className="space-y-1">
              <p className="font-semibold">Вече сте участвали тази седмица.</p>
              <p className="text-xs text-amber-800">Следващ опит: {unlockLabel}.</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Един опит на седмица. След отговор заключваме до неделя 23:59.
          </div>
        )}
        <div className="rounded-lg border border-border bg-muted/40 p-4 font-mono text-sm leading-relaxed">
          {codeLines.map((line, idx) => (
            <div key={idx} className="flex gap-3">
              <span className="w-8 text-right text-muted-foreground">{idx + 1}</span>
              <pre className="whitespace-pre-wrap">{line}</pre>
            </div>
          ))}
        </div>

        <RadioGroup
          onValueChange={(val) => setSelectedOptionId(Number(val))}
          className="space-y-2"
          disabled={isLocked || isSubmitting}
        >
          {currentQuestion.options.map((opt) => (
            <label key={opt.id} className={getOptionStyles(opt)}>
              <RadioGroupItem value={opt.id.toString()} />
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="uppercase">{opt.key}</Badge>
                <span>{opt.text}</span>
              </div>
              {lastResult && lastResult.questionId === currentQuestion.id && (
                <div className="ml-auto flex items-center gap-2 text-xs font-semibold">
                  {lastResult.selected === opt.key && lastResult.correct === opt.key && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-900">Ваш избор · Верен</Badge>
                  )}
                  {lastResult.selected === opt.key && lastResult.correct !== opt.key && (
                    <Badge variant="secondary" className="bg-red-100 text-red-900">Ваш избор</Badge>
                  )}
                  {lastResult.correct === opt.key && lastResult.selected !== opt.key && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-900">Верен отговор</Badge>
                  )}
                </div>
              )}
            </label>
          ))}
        </RadioGroup>

        <Button onClick={handleSubmit} className="w-full sm:w-auto" disabled={isLocked || isSubmitting}>
          {isSubmitting ? "Изпращане..." : "Изпрати"}
        </Button>
      </CardContent>
    </Card>
  );
};


const WeeklyPoll = () => {
    const { isAuthenticated, isLoading, openLoginDialog } = useAuth();
  
    return (
      <div className="min-h-screen w-full bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="mb-10 text-center">
            <Badge variant="secondary" className="mb-3">Седмична анкета</Badge>
            <h1 className="text-4xl font-bold sm:text-5xl">Код на седмицата</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Получавайте малко предизвикателство по програмиране всяка седмица.
            </p>
          </div>
  
          {isLoading ? (
             <div className="text-center">Зареждане...</div>
          ): isAuthenticated ? (
            <WeeklyPollContent />
          ) : (
            <div className="text-center text-lg text-muted-foreground">
              <p>Трябва да имате акаунт, за да участвате.</p>
              <Button onClick={openLoginDialog} className="mt-4">
                 Вход или Регистрация
              </Button>
            </div>
          )}
          
          <div className="mt-8">
            <PollStatistics />
          </div>
        </main>
        <Footer />
        <BackToTop />
        <CookieConsent />
      </div>
    );
  };
  
  export default WeeklyPoll;
