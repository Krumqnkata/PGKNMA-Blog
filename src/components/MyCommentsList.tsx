import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyComments, deleteMyComment, Comment } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Trash2, Loader2, ArrowUpRightFromSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ContentSkeleton, QueryEmptyState, QueryErrorState } from '@/components/query/QueryStates';
import { formatSiteDate } from '@/lib/date-time';

const MyCommentsList: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments, isLoading, isError, error, refetch } = useQuery<Comment[], Error>({
    queryKey: ['my-comments'],
    queryFn: getMyComments,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMyComment,
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Коментарът беше изтрит.",
      });
      queryClient.invalidateQueries({ queryKey: ['my-comments'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Грешка",
        description: error.message || "Възникна грешка при изтриването на коментара.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <ContentSkeleton variant="list" count={3} label="Зареждане на вашите коментари" />;
  }

  if (isError) {
    return <QueryErrorState message={error.message} onRetry={() => void refetch()} />;
  }

  if (!comments || comments.length === 0) {
    return (
      <QueryEmptyState art="comment" title="Нямате написани коментари" description="Имаш мнение за някоя новина? Разговорът те чака.">
        <Button asChild><Link to="/news">Към новините</Link></Button>
      </QueryEmptyState>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id} className="transition-[box-shadow,border-color] hover:border-primary/25 hover:shadow-md">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-grow">
              <p className="text-sm text-muted-foreground">
                Публикуван на: {formatSiteDate(comment.created_at)}
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">"{comment.content}"</p>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" asChild>
                <Link to={`/post/${comment.post_id}`} title="Отиди към публикацията">
                  <ArrowUpRightFromSquare className="h-4 w-4" />
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Изтриване на коментар</AlertDialogTitle>
                    <AlertDialogDescription>
                      Сигурни ли сте, че искате да изтриете този коментар? Това действие е необратимо.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отказ</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMutation.mutate(comment.id)} disabled={deleteMutation.isPending}>
                      {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Изтрий
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};


export default MyCommentsList;
