import { useQuery } from "@tanstack/react-query";
import { getPollStatistics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, CircleHelp, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { publicProfilePath } from '@/lib/public-profile';
import SiteRoleBadge from '@/components/SiteRoleBadge';

export const PollStatistics = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["pollStatistics"],
    queryFn: getPollStatistics,
  });

  if (isLoading) {
    return <div role="status" aria-label="Зареждане на статистиката" className="mt-8 grid gap-4 sm:grid-cols-3">{[1, 2, 3].map((item) => <Card key={item} className="space-y-4 p-6"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-9 w-1/3" /></Card>)}</div>;
  }

  if (isError) {
    return <Card className="mt-8 border-destructive/50 bg-destructive/10"><CardContent role="alert" className="flex flex-col items-start gap-3 p-6 text-destructive"><div className="flex gap-2"><AlertCircle size={20} />{error.message}</div><Button size="sm" variant="outline" onClick={() => void refetch()}>Опитай отново</Button></CardContent></Card>;
  }

  const statistics = [
    { label: "Участници", value: data?.total_participants ?? 0, icon: Users },
    { label: "Изпратени отговори", value: data?.total_answers ?? 0, icon: CircleHelp },
    { label: "Верни отговори", value: data?.correct_answers ?? 0, icon: CheckCircle2 },
  ];

  return <section className="mt-8 space-y-6"><div><h2 className="mb-4 text-2xl font-semibold">Статистика</h2><div className="grid gap-4 sm:grid-cols-3">{statistics.map(({ label, value, icon: Icon }) => <Card key={label}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{label}</CardTitle><Icon className="h-5 w-5 text-muted-foreground" /></CardHeader><CardContent><p className="text-3xl font-bold">{value}</p></CardContent></Card>)}</div></div><Card><CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" />Класация</CardTitle></CardHeader><CardContent>{data?.leaderboard.length ? <ol className="space-y-3">{data.leaderboard.map((user, index) => <li key={user.id} className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"><div className="flex min-w-0 items-center gap-2"><Link to={publicProfilePath(user.username)} className="truncate font-medium hover:text-primary hover:underline">{index + 1}. {user.username}</Link><SiteRoleBadge role={user.site_role} compact /></div><span className="shrink-0 text-sm text-muted-foreground">{user.correct_answers} верни {user.correct_answers === 1 ? "отговор" : "отговора"}</span></li>)}</ol> : <p className="text-muted-foreground">Все още няма верни отговори.</p>}</CardContent></Card></section>;
};
