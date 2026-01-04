import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChangelog } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import MainLayout from '@/components/MainLayout';

interface ChangelogEntry {
  content: string;
  updated_at: string;
}

const Changelog: React.FC = () => {
  const { data: changelogEntries, isLoading, error } = useQuery<ChangelogEntry[], Error>({
    queryKey: ['changelog'],
    queryFn: getChangelog,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-10 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Зареждане на промените...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto py-10">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Грешка</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Възникна грешка при зареждането на промените: {error.message}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Опитай отново
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">История на промените в сайта</h1>
          
          {changelogEntries && changelogEntries.length > 0 ? (
            <div className="space-y-6">
              {changelogEntries.map((entry, index) => (
                <Card key={index} className="transition-all duration-200 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {formatDate(entry.updated_at)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{entry.content}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">Все още няма записани промени.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Changelog;