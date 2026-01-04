import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMySongSuggestions, deleteMySongSuggestion, ApprovedSong } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MicOff, Trash2 } from 'lucide-react';
import SongMediaDisplay from './SongMediaDisplay';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const MySongSuggestionsList: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: songs, isLoading, isError, error } = useQuery<ApprovedSong[], Error>({
    queryKey: ['my-song-suggestions'],
    queryFn: getMySongSuggestions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMySongSuggestion,
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Предложението за песен беше изтрито.",
      });
      queryClient.invalidateQueries({ queryKey: ['my-song-suggestions'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Грешка",
        description: error.message || "Възникна грешка при изтриването.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded bg-green-900 text-green-300">Одобрено</span>;
      case 'rejected':
        return <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded bg-red-900 text-red-300">Отхвърлено</span>;
      case 'pending':
      default:
        return <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded bg-yellow-900 text-yellow-300">Чакащо</span>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (isError) {
    return <div className="text-destructive p-4">Грешка при зареждане на песните: {error.message}</div>;
  }

  if (!songs || songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg">
        <MicOff className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Нямате предложения</h3>
        <p className="mt-1 text-sm text-muted-foreground">Все още не сте предложили песен за училищния звънец.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {songs.map((song) => (
        <Card key={song.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{song.title}</CardTitle>
                <CardDescription>
                  Предложено на: {new Date(song.submitted_at).toLocaleDateString('bg-BG')} | Гласове: {song.votes}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(song.status)}
                {song.status === 'pending' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Изтриване на предложение</AlertDialogTitle>
                        <AlertDialogDescription>
                          Сигурни ли сте, че искате да изтриете това предложение?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отказ</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(song.id)} disabled={deleteMutation.isPending}>
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
            <SongMediaDisplay link={song.link} title={song.title} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MySongSuggestionsList;
