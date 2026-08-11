import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyMemes, deleteMyMeme, Meme } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ImageOff, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AuthenticatedImage } from '@/components/AuthenticatedImage';
import { ContentSkeleton, QueryErrorState } from '@/components/query/QueryStates';

const MyMemesList: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: memes, isLoading, isError, error, refetch } = useQuery<Meme[], Error>({
    queryKey: ['my-memes'],
    queryFn: getMyMemes,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMyMeme,
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Мемето беше изтрито.",
      });
      queryClient.invalidateQueries({ queryKey: ['my-memes'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Грешка",
        description: error.message || "Възникна грешка при изтриването на мемето.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: Meme['status']) => {
    if (status === 'approved') {
      return <span className="mr-2 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">Одобрено</span>;
    }
    if (status === 'rejected') {
      return <span className="mr-2 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">Отхвърлено</span>;
    }
    return <span className="mr-2 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-300">Изчакващо</span>;
  };

  if (isLoading) {
    return <ContentSkeleton count={3} label="Зареждане на вашите мемета" />;
  }

  if (isError) {
    return <QueryErrorState message={error.message} onRetry={() => void refetch()} />;
  }

  if (!memes || memes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/70 bg-card/50 p-10 text-center">
        <ImageOff className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Нямате качени мемета</h3>
        <p className="mt-1 text-sm text-muted-foreground">Все още не сте качили меме за 'Меме на седмицата'.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {memes.map((meme) => (
        <Card key={meme.id} className="transition-[box-shadow,border-color] hover:border-primary/25 hover:shadow-md">
          <CardHeader>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
              <div className="min-w-0 flex-1">
                <CardTitle className="break-words [overflow-wrap:anywhere]">{meme.title}</CardTitle>
                <CardDescription>
                  Качено на: {new Date(meme.created_at).toLocaleDateString('bg-BG')} | Гласове: {meme.votes}
                </CardDescription>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {getStatusBadge(meme.status)}
                {meme.status === 'pending' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Изтриване на меме</AlertDialogTitle>
                        <AlertDialogDescription>
                          Сигурни ли сте, че искате да изтриете това меме?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отказ</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(meme.id)} disabled={deleteMutation.isPending}>
                          {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Изтрий
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AuthenticatedImage src={meme.image_url} alt={meme.title} className="max-h-96 w-auto rounded-2xl border border-border/60 shadow-sm" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};


export default MyMemesList;
