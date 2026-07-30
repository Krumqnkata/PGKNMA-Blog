import { useQuery } from "@tanstack/react-query";
import { getPollStatistics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, CircleHelp, Trophy, Users } from "lucide-react";

export const PollStatistics = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pollStatistics"],
    queryFn: getPollStatistics,
  });

  if (isLoading) {
    return <div className="mt-8 grid gap-4 sm:grid-cols-3">{[1, 2, 3].map((item) => <Card key={item} className="h-32 animate-pulse bg-muted" />)}</div>;
  }

  if (isError) {
    return <Card className="mt-8 border-destructive/50 bg-destructive/10"><CardContent className="flex gap-2 p-6 text-destructive"><AlertCircle size={20} />{error.message}</CardContent></Card>;
  }

  const statistics = [
    { label: "Участници", value: data?.total_participants ?? 0, icon: Users },
    { label: "Изпратени отговори", value: data?.total_answers ?? 0, icon: CircleHelp },
    { label: "Верни отговори", value: data?.correct_answers ?? 0, icon: CheckCircle2 },
  ];

  return <section className="mt-8 space-y-6"><div><h2 className="mb-4 text-2xl font-semibold">Статистика</h2><div className="grid gap-4 sm:grid-cols-3">{statistics.map(({ label, value, icon: Icon }) => <Card key={label}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{label}</CardTitle><Icon className="h-5 w-5 text-muted-foreground" /></CardHeader><CardContent><p className="text-3xl font-bold">{value}</p></CardContent></Card>)}</div></div><Card><CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" />Класация</CardTitle></CardHeader><CardContent>{data?.leaderboard.length ? <ol className="space-y-3">{data.leaderboard.map((user, index) => <li key={user.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"><span className="font-medium">{index + 1}. {user.username}</span><span className="text-sm text-muted-foreground">{user.correct_answers} верни {user.correct_answers === 1 ? "отговор" : "отговора"}</span></li>)}</ol> : <p className="text-muted-foreground">Все още няма верни отговори.</p>}</CardContent></Card></section>;
};
