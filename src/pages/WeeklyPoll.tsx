import { useCallback, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Question = {
  id: string;
  title: string;
  prompt: string;
  hint?: string;
  tags: string[];
};

const questions: Question[] = [
  {
    id: "unique-values",
    title: "Код на седмицата: уникални стойности",
    prompt: "Напишете функция, която приема масив и връща нов масив само с уникалните елементи, запазвайки реда им.",
    hint: "Може да използвате Set или обект за маркиране на срещнати стойности.",
    tags: ["JS/TS", "масиви", "Set", "функции"],
  },
  {
    id: "palindrome",
    title: "Проверка за палиндром",
    prompt: "Напишете функция, която проверява дали даден низ е палиндром, игнорирайки интервали и главни/малки букви.",
    hint: "Нормализирайте входа и сравнете със същия низ, обърнат назад.",
    tags: ["низове", "алгоритми"],
  },
  {
    id: "fizzbuzz",
    title: "FizzBuzz с обобщение",
    prompt: "Напишете функция, която отпечатва FizzBuzz за числа от 1 до N и връща статистика колко пъти са изписани 'Fizz', 'Buzz' и 'FizzBuzz'.",
    tags: ["цикли", "условия"],
  },
  {
    id: "chunk",
    title: "Групиране на елементи",
    prompt: "Напишете функция chunk(array, size), която разделя масив на подмасиви с дължина size.",
    tags: ["масиви", "функции"],
  },
];

const getRandomQuestion = () => questions[Math.floor(Math.random() * questions.length)];

const WeeklyPoll = () => {
  const [current, setCurrent] = useState<Question>(() => getRandomQuestion());

  const refreshQuestion = useCallback(() => {
    const next = getRandomQuestion();
    setCurrent(next);
  }, []);

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
              <CardDescription>Случаен въпрос от рубриката „Код на седмицата“</CardDescription>
            </div>
            <Button variant="outline" onClick={refreshQuestion} className="shrink-0">
              Нов въпрос
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-relaxed">{current.prompt}</p>
            {current.hint && (
              <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
                <strong className="mr-2">Подсказка:</strong>
                {current.hint}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {current.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
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
