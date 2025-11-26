import { useCallback, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";

type Question = {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  options: { key: "a" | "b" | "c" | "d"; text: string; correct?: boolean }[];
};

const questions: Question[] = [
  {
    id: "unique-values",
    title: "Какво принтира?",
    subtitle: "Работа с map и filter",
    code: `const nums = [1, 2, 3];\nconst result = nums\n  .map((n) => n * 2)\n  .filter((n) => n > 3);\nconsole.log(result.join("-"));`,
    options: [
      { key: "a", text: "2-4-6" },
      { key: "b", text: "4-6" },
      { key: "c", text: "6" },
      { key: "d", text: "4-6-8", correct: true },
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

const WeeklyPoll = () => {
  const [current, setCurrent] = useState<Question>(() => getRandomQuestion());
  const [selected, setSelected] = useState<"a" | "b" | "c" | "d" | "">("");

  const refreshQuestion = useCallback(() => {
    const next = getRandomQuestion();
    setCurrent(next);
    setSelected("");
  }, []);

  const handleSubmit = useCallback(() => {
    const correct = current.options.find((o) => o.correct);
    if (!selected) {
      toast({ title: "Изберете отговор", description: "Моля, маркирайте един от вариантите." });
      return;
    }
    const isCorrect = selected === correct?.key;
    toast({
      title: isCorrect ? "Браво!" : "Опитай пак",
      description: isCorrect ? "Отговорът е верен." : `Верен е вариант ${correct?.key.toUpperCase()}.`,
      variant: isCorrect ? "default" : "destructive",
    });
  }, [current.options, selected]);

  const codeLines = useMemo(() => current.code.split("\n"), [current.code]);

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
            <Button variant="outline" onClick={refreshQuestion} className="shrink-0">
              Нов въпрос
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <RadioGroup value={selected} onValueChange={(val) => setSelected(val as any)} className="space-y-2">
                {current.options.map((opt) => (
                  <label
                    key={opt.key}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <RadioGroupItem value={opt.key} />
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="uppercase">
                        {opt.key}
                      </Badge>
                      <span>{opt.text}</span>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button onClick={handleSubmit} className="sm:w-auto w-full">
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
    </div>
  );
};

export default WeeklyPoll;
