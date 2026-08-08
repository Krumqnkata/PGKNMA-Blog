import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChangelog } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import MainLayout from '@/components/MainLayout';
import { ContentSkeleton, QueryEmptyState, QueryErrorState } from '@/components/query/QueryStates';
interface ChangelogEntry {
  content: string;
  updated_at: string;
}

const Changelog: React.FC = () => {
  const { data: changelogEntries, isLoading, error, refetch } = useQuery<ChangelogEntry[], Error>({
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
        <div className="container mx-auto py-10"><ContentSkeleton variant="list" count={3} label="Зареждане на историята на промените" className="mx-auto max-w-4xl" /></div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto py-10"><QueryErrorState className="mx-auto max-w-2xl" message={error.message} onRetry={() => void refetch()} /></div>
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
                    <MarkdownRenderer content={entry.content} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <QueryEmptyState title="Все още няма записани промени" description="Историята на следващите версии ще се показва тук." />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Changelog;
