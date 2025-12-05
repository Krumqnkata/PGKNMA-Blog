import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import CookieConsent from "@/components/CookieConsent";
type Question = {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  options: { key: "a" | "b" | "c" | "d"; text: string; correct?: boolean }[];
};

type AnswerKey = "a" | "b" | "c" | "d";
type LockCookie = {
  lockedUntil: string;
  questionId: string;
  selected: AnswerKey;
  correct: AnswerKey;
};

const WEEKLY_POLL_COOKIE = "weekly-poll-locked";
const COOKIE_PATH = "; path=/";

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const clearCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT${COOKIE_PATH}`;
};

const getNextSundayDeadline = () => {
  const now = new Date();
  const deadline = new Date(now);
  const daysUntilSunday = (7 - now.getDay()) % 7;
  deadline.setDate(now.getDate() + daysUntilSunday);
  deadline.setHours(23, 59, 0, 0);
  if (deadline <= now) {
    deadline.setDate(deadline.getDate() + 7);
  }
  return deadline;
};

const questions: Question[] = [
  {
    id: "unique-values",
    title: "Какво принтира?",
    subtitle: "Работа с map и filter",
    code: `const nums = [1, 2, 3];\nconst result = nums\n  .map((n) => n * 2)\n  .filter((n) => n > 3);\nconsole.log(result.join("-"));`,
    options: [
      { key: "a", text: "2-4-6" },
      { key: "b", text: "4-6", correct: true },
      { key: "c", text: "6" },
      { key: "d", text: "4-6-8" },
    ],
  },
  {
    id: "palindrome",
    title: "Какво принтира?",
    subtitle: "Строги и нестроги сравнения",
    code: `const x = 0;\nconst y = false;\nconsole.log(x == y, x === y);`,
    options: [
      { key: "a", text: "true true" },
      { key: "b", text: "false true" },
      { key: "c", text: "true false", correct: true },
      { key: "d", text: "false false" },
    ],
  },
  {
    id: "fizzbuzz",
    title: "Какво принтира?",
    subtitle: "Обхождане на масив и push",
    code: `const arr = [1, 2, 3];\narr.push(arr.shift());\nconsole.log(arr);`,
    options: [
      { key: "a", text: "[2, 3, 1]", correct: true },
      { key: "b", text: "[3, 1, 2]" },
      { key: "c", text: "[1, 2, 3, 1]" },
      { key: "d", text: "[2, 3]" },
    ],
  },
  {
    id: "chunk",
    title: "Какво принтира?",
    subtitle: "Hoisting на функции/променливи",
    code: `console.log(foo());\nfunction foo() {\n  return bar;\n}\nvar bar = 5;`,
    options: [
      { key: "a", text: "ReferenceError" },
      { key: "b", text: "undefined", correct: true },
      { key: "c", text: "5" },
      { key: "d", text: "TypeError" },
    ],
  },
];

const getRandomQuestion = () => questions[Math.floor(Math.random() * questions.length)];

const findQuestionById = (id: string) => questions.find((q) => q.id === id) ?? getRandomQuestion();

const WeeklyPoll = () => {
  const [current, setCurrent] = useState<Question>(() => getRandomQuestion());
  const [selected, setSelected] = useState<AnswerKey | "">("");
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  const [lastResult, setLastResult] = useState<{ questionId: string; selected: AnswerKey; correct: AnswerKey } | null>(
    null,
  );

  const isLocked = useMemo(() => Boolean(lockedUntil && lockedUntil.getTime() > Date.now()), [lockedUntil]);

  useEffect(() => {
    const cookie = getCookieValue(WEEKLY_POLL_COOKIE);
    if (!cookie) return;
    try {
      const parsed: LockCookie | string = JSON.parse(cookie);
      if (typeof parsed === "string") {
        const date = new Date(parsed);
        if (Number.isNaN(date.getTime()) || date <= new Date()) {
          clearCookie(WEEKLY_POLL_COOKIE);
          return;
        }
        setLockedUntil(date);
        return;
      }
      const date = new Date(parsed.lockedUntil);
      if (Number.isNaN(date.getTime()) || date <= new Date()) {
        clearCookie(WEEKLY_POLL_COOKIE);
        return;
      }
      setLockedUntil(date);
      setCurrent(findQuestionById(parsed.questionId));
      setSelected(parsed.selected);
      setLastResult({ questionId: parsed.questionId, selected: parsed.selected, correct: parsed.correct });
    } catch (err) {
      const fallback = new Date(cookie);
      if (Number.isNaN(fallback.getTime()) || fallback <= new Date()) {
        clearCookie(WEEKLY_POLL_COOKIE);
        return;
      }
      setLockedUntil(fallback);
    }
  }, []);

  useEffect(() => {
    if (!lockedUntil) return;
    const msUntilUnlock = lockedUntil.getTime() - Date.now();
    if (msUntilUnlock <= 0) {
      setLockedUntil(null);
      clearCookie(WEEKLY_POLL_COOKIE);
      setSelected("");
      setLastResult(null);
      setCurrent(getRandomQuestion());
      return;
    }
    const timer = window.setTimeout(() => {
      setLockedUntil(null);
      clearCookie(WEEKLY_POLL_COOKIE);
      setSelected("");
      setLastResult(null);
      setCurrent(getRandomQuestion());
    }, msUntilUnlock);
    return () => window.clearTimeout(timer);
  }, [lockedUntil]);

  const lockForWeek = useCallback((question: Question, answer: AnswerKey, correct: AnswerKey) => {
    const expiresAt = getNextSundayDeadline();
    if (typeof document === "undefined") return;
    const payload: LockCookie = {
      lockedUntil: expiresAt.toISOString(),
      questionId: question.id,
      selected: answer,
      correct,
    };
    document.cookie = `${WEEKLY_POLL_COOKIE}=${encodeURIComponent(JSON.stringify(payload))}${COOKIE_PATH}; expires=${expiresAt.toUTCString()}`;
    setLockedUntil(expiresAt);
    setLastResult({ questionId: question.id, selected: answer, correct });
  }, []);

  const refreshQuestion = useCallback(() => {
    if (isLocked) return;
    const next = getRandomQuestion();
    setCurrent(next);
    setSelected("");
    setLastResult(null);
  }, [isLocked]);

  const handleSubmit = useCallback(() => {
    if (isLocked) {
      toast({
        title: "Вече сте отговорили",
        description: lockedUntil
          ? `Можете да опитате отново след ${lockedUntil.toLocaleString("bg-BG", {
              weekday: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}.`
          : "Ще отключим следващата седмица.",
        variant: "destructive",
      });
      return;
    }
    const correct = current.options.find((o) => o.correct);
    if (!selected) {
      toast({ title: "Изберете отговор", description: "Моля, маркирайте един от вариантите." });
      return;
    }
    if (!correct?.key) {
      toast({ title: "Липсва правилен отговор", description: "Моля, опитайте по-късно." });
      return;
    }
    const isCorrect = selected === correct.key;
    lockForWeek(current, selected as AnswerKey, correct.key);
    toast({
      title: isCorrect ? "Браво!" : "Опитай пак",
      description: isCorrect ? "Отговорът е верен." : `Верен е вариант ${correct?.key.toUpperCase()}.`,
      variant: isCorrect ? "default" : "destructive",
    });
  }, [current, isLocked, lockForWeek, lockedUntil, selected]);

  const codeLines = useMemo(() => current.code.split("\n"), [current.code]);
  const unlockLabel = useMemo(() => {
    if (!lockedUntil) return "";
    return lockedUntil.toLocaleString("bg-BG", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [lockedUntil]);

  const getOptionStyles = useCallback(
    (optKey: AnswerKey) => {
      const base = "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors";
      if (!lastResult || lastResult.questionId !== current.id) {
        return `${base} border-border hover:bg-muted/50`;
      }
      const isSelected = lastResult.selected === optKey;
      const isCorrect = lastResult.correct === optKey;
      if (isSelected && isCorrect) return `${base} border-emerald-400 bg-emerald-100 text-emerald-900`;
      if (isSelected && !isCorrect) return `${base} border-red-400 bg-red-100 text-red-900`;
      if (!isSelected && isCorrect) return `${base} border-emerald-300 bg-emerald-50 text-emerald-900`;
      return `${base} border-border hover:bg-muted/50`;
    },
    [current.id, lastResult],
  );

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <Badge variant="secondary" className="mb-3">Седмична анкета</Badge>
          <h1 className="text-4xl font-bold sm:text-5xl">Код на седмицата</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Получавайте малко предизвикателство по програмиране всяка седмица и споделяйте решенията си във форума или чата.
          </p>
        </div>

        <Card className="mx-auto max-w-3xl border-border bg-card/90 shadow-lg">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-2xl">{current.title}</CardTitle>
              <CardDescription>{current.subtitle}</CardDescription>
            </div>
            <Button variant="outline" onClick={refreshQuestion} className="shrink-0" disabled={isLocked}>
              Нов въпрос
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLocked ? (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <Badge variant="secondary" className="bg-amber-200 text-amber-900">
                  Заключено
                </Badge>
                <div className="space-y-1">
                  <p className="font-semibold">Вече сте участвали тази седмица.</p>
                  <p className="text-xs text-amber-800">
                    Следващ опит: {unlockLabel || "неделя, 23:59"}.
                  </p>
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

            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">Изберете правилния отговор:</p>
              <RadioGroup
                value={selected}
                onValueChange={(val: AnswerKey) => {
                  if (isLocked) return;
                  setSelected(val);
                }}
                className="space-y-2"
              >
                {current.options.map((opt) => (
                  <label
                    key={opt.key}
                    className={getOptionStyles(opt.key)}
                  >
                    <RadioGroupItem value={opt.key} disabled={isLocked} />
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="uppercase">
                        {opt.key}
                      </Badge>
                      <span>{opt.text}</span>
                    </div>
                    {lastResult && lastResult.questionId === current.id && (
                      <div className="ml-auto flex items-center gap-2 text-xs font-semibold">
                        {lastResult.selected === opt.key && lastResult.correct === opt.key && (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-900">
                            Вашият избор · Верен
                          </Badge>
                        )}
                        {lastResult.selected === opt.key && lastResult.correct !== opt.key && (
                          <Badge variant="secondary" className="bg-red-100 text-red-900">
                            Вашият избор
                          </Badge>
                        )}
                        {lastResult.correct === opt.key && lastResult.selected !== opt.key && (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-900">
                            Верен отговор
                          </Badge>
                        )}
                      </div>
                    )}
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button onClick={handleSubmit} className="sm:w-auto w-full" disabled={isLocked}>
                Изпрати
              </Button>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">a</Badge>
                <Badge variant="outline">b</Badge>
                <Badge variant="outline">c</Badge>
                <Badge variant="outline">d</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
      <BackToTop />
      <CookieConsent/>
    </div>
  );
};

export default WeeklyPoll;
