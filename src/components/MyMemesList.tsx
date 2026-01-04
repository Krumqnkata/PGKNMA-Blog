import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyMemes, Meme } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ImageOff } from 'lucide-react';

const MyMemesList: React.FC = () => {
  const { data: memes, isLoading, isError, error } = useQuery<Meme[], Error>({
    queryKey: ['my-memes'],
    queryFn: getMyMemes,
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
              {getStatusBadge(meme.is_approved)}
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
