import { useCallback, useMemo, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type Question = {
  id: string;
  title: string;
  subtitle:string;
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

const WeeklyPoll = () => {
  const [current, setCurrent] = useState<Question>(() => getRandomQuestion());
  const [selected, setSelected] = useState<"a" | "b" | "c" | "d" | "">("");
  const [hasVoted, setHasVoted] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const voted = Cookies.get(`voted-${current.id}`);
    if (voted) {
      setHasVoted(true);
      const storedVotes = JSON.parse(Cookies.get(`votes-${current.id}`) || '{}');
      updateChartData(storedVotes);
    }
  }, [current.id]);

  const updateChartData = (votes: any) => {
    const data = current.options.map(option => ({
      name: option.key.toUpperCase(),
      votes: votes[option.key] || 0
    }));
    setChartData(data);
  };

  const refreshQuestion = useCallback(() => {
    let next = getRandomQuestion();
    while(next.id === current.id) {
        next = getRandomQuestion();
    }
    setCurrent(next);
    setSelected("");
    setHasVoted(false);
    setChartData([]);
  }, [current.id]);

  const handleSubmit = useCallback(() => {
    if (!selected) {
      toast({ title: "Изберете отговор", description: "Моля, маркирайте един от вариантите." });
      return;
    }

    const correct = current.options.find((o) => o.correct);
    const isCorrect = selected === correct?.key;
    toast({
      title: isCorrect ? "Браво!" : "Грешен отговор",
      description: isCorrect ? "Отговорът е верен." : `Верен е вариант ${correct?.key.toUpperCase()}.`,
      variant: isCorrect ? "default" : "destructive",
    });

    if (!hasVoted) {
      const storedVotes = JSON.parse(Cookies.get(`votes-${current.id}`) || '{}');
      storedVotes[selected] = (storedVotes[selected] || 0) + 1;
      Cookies.set(`votes-${current.id}`, JSON.stringify(storedVotes), { expires: 7 });
      Cookies.set(`voted-${current.id}`, 'true', { expires: 7 });
      setHasVoted(true);
      updateChartData(storedVotes);
    }
  }, [current.id, current.options, selected, hasVoted]);

  const codeLines = useMemo(() => current.code.split("\n"), [current.code]);

  return (
    <Card className="mx-auto max-w-3xl border-border bg-card/90 shadow-lg transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-2xl font-bold tracking-tight">{current.title}</CardTitle>
          <CardDescription className="mt-1 text-muted-foreground">{current.subtitle}</CardDescription>
        </div>
        <Button variant="outline" onClick={refreshQuestion} className="shrink-0">
          Нов въпрос
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-border bg-muted/40 p-4 font-mono text-sm leading-relaxed shadow-inner">
          {codeLines.map((line, idx) => (
            <div key={idx} className="flex gap-3">
              <span className="w-8 select-none text-right text-muted-foreground">{idx + 1}</span>
              <pre className="whitespace-pre-wrap">{line}</pre>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {hasVoted && (
            <p className="text-sm font-semibold text-green-500">
              Вече сте отговорили на тази анкета.
            </p>
          )}
          <p className="text-sm font-semibold text-muted-foreground">Изберете правилния отговор:</p>
          <RadioGroup value={selected} onValueChange={(val) => setSelected(val as any)} className="space-y-2" disabled={hasVoted}>
            {current.options.map((opt) => (
              <label
                key={opt.key}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors ${hasVoted ? 'cursor-not-allowed opacity-70' : 'hover:bg-muted/50'
                  }`}
              >
                <RadioGroupItem value={opt.key} disabled={hasVoted} />
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="uppercase">
                    {opt.key}
                  </Badge>
                  <span className="font-medium">{opt.text}</span>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>

        {hasVoted && chartData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-center">Резултати</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="votes" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-border mt-6">
          <Button onClick={handleSubmit} className="w-full sm:w-auto" disabled={hasVoted}>
            {hasVoted ? 'Вече сте гласували' : 'Изпрати'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyPoll;
