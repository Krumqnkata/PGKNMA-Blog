import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, BellRing, Flag, Sparkles, Star, Trophy } from 'lucide-react';

import { ContentSkeleton, QueryErrorState } from '@/components/query/QueryStates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import BrowserPushSettings from '@/components/BrowserPushSettings';
import { useToast } from '@/hooks/use-toast';
import {
  getNotificationPreferences,
  type NotificationPreferences,
  updateNotificationPreferences,
} from '@/lib/api';

type PreferenceKey = Exclude<keyof NotificationPreferences, 'updated_at'>;

const options: Array<{
  key: PreferenceKey;
  title: string;
  description: string;
  icon: typeof BellRing;
}> = [
  {
    key: 'general_enabled',
    title: 'Официални известия',
    description: 'Важни съобщения и промени от училищния блог.',
    icon: BellRing,
  },
  {
    key: 'points_enabled',
    title: 'Получени точки',
    description: 'Известия при добавяне на точки към профила.',
    icon: Sparkles,
  },
  {
    key: 'levels_enabled',
    title: 'Нови нива',
    description: 'Когато достигнете следващо ниво.',
    icon: Trophy,
  },
  {
    key: 'badges_enabled',
    title: 'Получени значки',
    description: 'При отключване на нова значка.',
    icon: Award,
  },
  {
    key: 'missions_enabled',
    title: 'Завършени мисии',
    description: 'Напредък и успешно завършени мисии.',
    icon: Flag,
  },
  {
    key: 'rewards_enabled',
    title: 'Дигитални награди',
    description: 'При отключване на рамка, титла или друга награда.',
    icon: Star,
  },
];

export default function NotificationPreferencesCard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const queryKey = ['notification-preferences'] as const;
  const preferencesQuery = useQuery({
    queryKey,
    queryFn: getNotificationPreferences,
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, enabled }: { key: PreferenceKey; enabled: boolean }) => (
      updateNotificationPreferences({ [key]: enabled })
    ),
    onMutate: async ({ key, enabled }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationPreferences>(queryKey);
      if (previous) {
        queryClient.setQueryData<NotificationPreferences>(queryKey, {
          ...previous,
          [key]: enabled,
        });
      }
      return { previous };
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      toast({ title: 'Настройката не е запазена', description: error.message, variant: 'destructive' });
    },
    onSuccess: (preferences) => {
      queryClient.setQueryData(queryKey, preferences);
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary/10 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5 text-primary" aria-hidden="true" />
          Настройки за известия
        </CardTitle>
        <CardDescription>
          Изборът се пази в профила и важи на всички ваши устройства.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5 sm:pt-6">
        {preferencesQuery.isLoading ? (
          <ContentSkeleton count={2} variant="list" label="Зареждане на настройките за известия" />
        ) : preferencesQuery.isError || !preferencesQuery.data ? (
          <QueryErrorState
            message={preferencesQuery.error instanceof Error ? preferencesQuery.error.message : undefined}
            onRetry={() => void preferencesQuery.refetch()}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {options.map(({ key, title, description, icon: Icon }) => {
              const inputId = `notification-preference-${key}`;
              return (
                <div key={key} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
                  <span className="rounded-xl bg-primary/10 p-2 text-primary" aria-hidden="true">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <label htmlFor={inputId} className="cursor-pointer text-sm font-bold text-foreground">
                      {title}
                    </label>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                  <Switch
                    id={inputId}
                    checked={preferencesQuery.data[key]}
                    disabled={updateMutation.isPending}
                    onCheckedChange={(enabled) => updateMutation.mutate({ key, enabled })}
                    aria-label={title}
                  />
                </div>
              );
            })}
          </div>
        )}
        <BrowserPushSettings />
      </CardContent>
    </Card>
  );
}
