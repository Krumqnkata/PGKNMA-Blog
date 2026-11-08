import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChangelog } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import MainLayout from '@/components/MainLayout';
import { ContentSkeleton, QueryEmptyState, QueryErrorState } from '@/components/query/QueryStates';
import { InteriorPage, InteriorPageHero, InteriorSection } from '@/components/InteriorPage';
import { formatSiteDateTime } from '@/lib/date-time';
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
    return formatSiteDateTime(dateString, {
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
    <InteriorPage>
      <InteriorPageHero eyebrow="Развитие на платформата" title={<>История на <span className="text-primary">промените</span></>} description="Нови възможности, подобрения и поправки — подредени хронологично." art="scroll" />
      <InteriorSection containerClassName="max-w-4xl">
          
          {changelogEntries && changelogEntries.length > 0 ? (
            <div className="space-y-6">
              {changelogEntries.map((entry, index) => (
                <Card key={index} className="relative overflow-hidden transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg motion-reduce:hover:translate-y-0">
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-blue-500" aria-hidden="true" />
                  <CardHeader className="border-b border-border/60 bg-muted/25">
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
            <QueryEmptyState art="scroll" title="Все още няма записани промени" description="Историята на следващите версии ще се показва тук." />
          )}
      </InteriorSection>
    </InteriorPage>
  );
};

export default Changelog;
