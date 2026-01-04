import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMySongSuggestions, ApprovedSong } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MicOff } from 'lucide-react';
import SongMediaDisplay from './SongMediaDisplay'; // Assuming this component can display a song

const MySongSuggestionsList: React.FC = () => {
  const { data: songs, isLoading, isError, error } = useQuery<ApprovedSong[], Error>({
    queryKey: ['my-song-suggestions'],
    queryFn: getMySongSuggestions,
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
              {getStatusBadge(song.status)}
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
