import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMySongSuggestions, deleteMySongSuggestion, ApprovedSong } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2, Trash2 } from 'lucide-react';
import SongMediaDisplay from './SongMediaDisplay';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ContentSkeleton, QueryEmptyState, QueryErrorState } from '@/components/query/QueryStates';
import { formatSiteDate } from '@/lib/date-time';

const MySongSuggestionsList: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: songs, isLoading, isError, error, refetch } = useQuery<ApprovedSong[], Error>({
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
        return <span className="mr-2 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">Одобрено</span>;
      case 'rejected':
        return <span className="mr-2 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">Отхвърлено</span>;
      case 'pending':
      default:
        return <span className="mr-2 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-300">Чакащо</span>;
    }
  };

  if (isLoading) {
    return <ContentSkeleton variant="list" count={3} label="Зареждане на предложенията за песни" />;
  }

  if (isError) {
    return <QueryErrorState message={error.message} onRetry={() => void refetch()} />;
  }

  if (!songs || songs.length === 0) {
    return (
      <QueryEmptyState art="bell" title="Нямате предложения" description="Звънецът чака твоята песен. Какво да звучи в междучасието?">
        <Button asChild><Link to="/bell-suggest">Предложи песен</Link></Button>
      </QueryEmptyState>
    );
  }

  return (
    <div className="space-y-4">
      {songs.map((song) => (
        <Card key={song.id} className="transition-[box-shadow,border-color] hover:border-primary/25 hover:shadow-md">
          <CardHeader>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
              <div className="min-w-0 flex-1">
                <CardTitle className="break-words [overflow-wrap:anywhere]">{song.title}</CardTitle>
                <CardDescription>
                  Предложено на: {formatSiteDate(song.submitted_at)} | Гласове: {song.votes}
                </CardDescription>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
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
