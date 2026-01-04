import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyComments, deleteMyComment, Comment } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Trash2, Loader2, MessageSquareOff, ArrowUpRightFromSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const MyCommentsList: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments, isLoading, isError, error } = useQuery<Comment[], Error>({
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
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (isError) {
    return <div className="text-destructive p-4">Грешка при зареждане на коментарите: {error.message}</div>;
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg">
        <MessageSquareOff className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Нямате написани коментари</h3>
        <p className="mt-1 text-sm text-muted-foreground">Все още не сте коментирали нито една публикация.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex-grow">
              <p className="text-sm text-muted-foreground">
                Публикуван на: {new Date(comment.created_at).toLocaleDateString('bg-BG')}
              </p>
              <p className="mt-1">"{comment.content}"</p>
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
