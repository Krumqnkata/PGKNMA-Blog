import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, ArchiveRestore, BellOff, RefreshCw } from 'lucide-react';

import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import {
  getNotifications,
  restoreNotification,
  type Notification,
} from '@/lib/api';
import { formatSiteDateTime } from '@/lib/date-time';

function formatDate(value: string | null) {
  if (!value) return '';
  return formatSiteDateTime(value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ArchivedNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['notifications', 'archived', user?.id] as const;
  const { data = [], isLoading, error, refetch } = useQuery<Notification[], Error>({
    queryKey,
    queryFn: () => getNotifications({ archived: true }),
    enabled: Boolean(user),
  });

  const restoreMutation = useMutation({
    mutationFn: restoreNotification,
    onMutate: (id) => {
      queryClient.setQueryData<Notification[]>(queryKey, (current = []) => (
        current.filter((notification) => notification.id !== id)
      ));
    },
    onError: () => void queryClient.invalidateQueries({ queryKey }),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <section className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-lg shadow-primary/5">
      <div className="border-b border-border/70 bg-muted/30 px-5 py-5 sm:px-7">
        <div className="flex items-start gap-3">
          <span className="rounded-2xl bg-primary/10 p-2.5 text-primary">
            <Archive className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-black tracking-tight">Архивирани известия</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Ръчно скритите и изтеклите известия не се показват в камбанката. Автоматичният архив се пази още 90 дни.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div role="status" aria-label="Зареждане на архива" className="space-y-4 p-5 sm:p-7">
          {[1, 2, 3].map((item) => (
            <div key={item} className="space-y-2 rounded-2xl border border-border/60 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-sm text-destructive">Архивът не можа да бъде зареден.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Опитай отново
          </Button>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
          <span className="rounded-full bg-muted p-4 text-muted-foreground">
            <BellOff className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <p className="font-bold">Архивът е празен</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Скритите или изтеклите известия ще се появят тук.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {data.map((notification) => (
            <article key={notification.id} className="flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-muted/20 sm:flex-row sm:items-start sm:px-7">
              <div className="min-w-0 flex-1">
                <MarkdownRenderer
                  content={notification.html_text || notification.text}
                  className="prose prose-sm max-w-none break-words dark:prose-invert [&_p]:my-0"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {notification.is_auto_archived
                    ? 'Автоматично архивирано'
                    : 'Архивирано'}{' '}
                  {formatDate(notification.archived_at)}
                </p>
              </div>
              {notification.can_restore && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={restoreMutation.isPending}
                  onClick={() => restoreMutation.mutate(notification.id)}
                >
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Възстанови
                </Button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
