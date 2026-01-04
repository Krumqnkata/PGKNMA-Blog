import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyMemes, deleteMyMeme, Meme } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ImageOff, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const MyMemesList: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: memes, isLoading, isError, error } = useQuery<Meme[], Error>({
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

  const getStatusBadge = (isApproved: boolean) => {
    if (isApproved) {
      return <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded bg-green-900 text-green-300">Одобрено</span>;
    }
    return <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded bg-yellow-900 text-yellow-300">Чакащо</span>;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (isError) {
    return <div className="text-destructive p-4">Грешка при зареждане на меметата: {error.message}</div>;
  }

  if (!memes || memes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg">
        <ImageOff className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Нямате качени мемета</h3>
        <p className="mt-1 text-sm text-muted-foreground">Все още не сте качили меме за 'Меме на седмицата'.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {memes.map((meme) => (
        <Card key={meme.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{meme.title}</CardTitle>
                <CardDescription>
                  Качено на: {new Date(meme.created_at).toLocaleDateString('bg-BG')} | Гласове: {meme.votes}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(meme.is_approved)}
                {!meme.is_approved && (
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
            <img src={meme.image_url} alt={meme.title} className="rounded-lg max-h-96 w-auto" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};


export default MyMemesList;
