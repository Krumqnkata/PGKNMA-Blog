import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellOff, BellRing, Loader2, Smartphone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getPushConfig } from '@/lib/api';
import {
  currentPushRegistration,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
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

  const serverEnabled = Boolean(configQuery.data?.enabled);
  const unavailable = !supported || (configQuery.isSuccess && !serverEnabled);

  return (
    <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/[0.045] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="rounded-xl bg-primary/10 p-2.5 text-primary" aria-hidden="true">
          <Smartphone className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-bold text-foreground">Известия от браузъра</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {isSubscribed
              ? 'Активни са на това устройство. Видовете известия се управляват от настройките по-горе.'
              : needsRepair
                ? 'Браузърът е разрешил известията, но устройството не е свързано с профила. Натиснете за повторно свързване.'
              : unavailable
                ? 'Функцията не е налична в този браузър или още не е активирана от администратора.'
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
  );
}
