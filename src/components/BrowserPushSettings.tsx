import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellOff, BellRing, CalendarDays, History, Loader2, Megaphone, Newspaper, Smartphone, Vote } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { getPushConfig, type PushDevicePreferences } from '@/lib/api';
import {
  currentPushRegistration,
  defaultPushDevicePreferences,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
  updatePushDevicePreferences,
} from '@/lib/push-notifications';

const statusKey = ['browser-push-subscription'] as const;

export default function BrowserPushSettings() {
  const supported = isPushSupported();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const configQuery = useQuery({
    queryKey: ['push-config'],
    queryFn: getPushConfig,
    enabled: supported,
    staleTime: 5 * 60_000,
  });
  const subscriptionQuery = useQuery({
    queryKey: statusKey,
    queryFn: currentPushRegistration,
    enabled: supported,
  });
  const hasLocalSubscription = Boolean(subscriptionQuery.data?.subscription);
  const isSubscribed = Boolean(hasLocalSubscription && subscriptionQuery.data?.registered);
  const needsRepair = hasLocalSubscription && !subscriptionQuery.data?.registered;
  const permissionDenied = supported && Notification.permission === 'denied';
  const devicePreferences = subscriptionQuery.data?.status?.preferences ?? defaultPushDevicePreferences;

  const mutation = useMutation({
    mutationFn: async () => {
      if (isSubscribed) {
        await unsubscribeFromPush();
      } else {
        await subscribeToPush(configQuery.data?.public_key ?? '');
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: statusKey });
      toast({
        title: isSubscribed ? 'Push известията са изключени' : 'Push известията са включени',
        description: isSubscribed
          ? 'Този браузър вече няма да получава известия.'
          : 'Ще получавате избраните известия и когато блогът не е отворен.',
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Настройката не е променена', description: error.message, variant: 'destructive' });
    },
  });

  const preferenceMutation = useMutation({
    mutationFn: updatePushDevicePreferences,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: statusKey });
      toast({ title: 'Настройките за това устройство са запазени' });
    },
    onError: (error: Error) => {
      toast({ title: 'Настройката не е запазена', description: error.message, variant: 'destructive' });
    },
  });

  const updatePreference = (key: keyof PushDevicePreferences, enabled: boolean) => {
    preferenceMutation.mutate({ ...devicePreferences, [key]: enabled });
  };

  const serverEnabled = Boolean(configQuery.data?.enabled);
  const unavailable = !supported || (configQuery.isSuccess && !serverEnabled);

  return (
    <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/[0.045] p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="rounded-xl bg-primary/10 p-2.5 text-primary" aria-hidden="true">
          <Smartphone className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-bold text-foreground">Известия от браузъра</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {isSubscribed
              ? 'Активни са на това устройство. Изберете темите за този браузър по-долу.'
              : needsRepair
                ? 'Браузърът е разрешил известията, но устройството не е свързано с профила. Натиснете за повторно свързване.'
              : unavailable
                ? 'Функцията не е налична в този браузър или още не е активирана от администратора.'
                : permissionDenied
                  ? 'Известията са блокирани от браузъра. Разрешете ги от иконата до адреса на сайта и опитайте отново.'
                  : 'Получавайте важните известия дори когато блогът не е отворен.'}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant={isSubscribed ? 'outline' : 'default'}
        className="shrink-0 gap-2 sm:min-w-40"
        disabled={unavailable || configQuery.isLoading || subscriptionQuery.isLoading || mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        ) : isSubscribed ? (
          <BellOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <BellRing className="h-4 w-4" aria-hidden="true" />
        )}
        {isSubscribed ? 'Изключи за устройството' : needsRepair ? 'Свържи отново' : 'Включи известията'}
      </Button>
      </div>

      {isSubscribed && (
        <div className="mt-4 grid gap-2 border-t border-border/60 pt-4 sm:grid-cols-2">
          {([
            ['general_enabled', 'Официални съобщения', Megaphone],
            ['posts_enabled', 'Нови публикации', Newspaper],
            ['events_enabled', 'Събития и напомняния', CalendarDays],
            ['polls_enabled', 'Нови анкети', Vote],
            ['changelog_enabled', 'Промени по сайта', History],
          ] as const).map(([key, label, Icon]) => (
            <label key={key} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-background/70 p-3 text-sm font-semibold">
              <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0 flex-1">{label}</span>
              <Switch
                checked={devicePreferences[key]}
                disabled={preferenceMutation.isPending}
                onCheckedChange={(enabled) => updatePreference(key, enabled)}
                aria-label={`${label} на това устройство`}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
