import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellRing, Loader2, ShieldCheck, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getPushConfig } from '@/lib/api';
import {
  currentPushRegistration,
  isPushSupported,
  subscribeToPush,
} from '@/lib/push-notifications';

const DISMISSED_AT_KEY = 'pgknma-push-prompt-dismissed-at-v1';
const SESSION_PAGE_COUNT_KEY = 'pgknma-push-prompt-page-count-v1';
const DISMISS_FOR_MS = 30 * 24 * 60 * 60 * 1000;

const wasRecentlyDismissed = () => {
  const dismissedAt = Number(localStorage.getItem(DISMISSED_AT_KEY) || 0);
  return dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_FOR_MS;
};

export default function PushOptInPrompt() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const supported = isPushSupported();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => wasRecentlyDismissed());

  const configQuery = useQuery({
    queryKey: ['push-config'],
    queryFn: getPushConfig,
    enabled: supported,
    staleTime: 5 * 60_000,
  });
  const subscriptionQuery = useQuery({
    queryKey: ['browser-push-subscription'],
    queryFn: currentPushRegistration,
    enabled: supported,
    retry: 1,
  });

  const isTvPage = location.pathname === '/tv' || location.pathname.startsWith('/tv/');
  const isSubscribed = Boolean(
    subscriptionQuery.data?.subscription && subscriptionQuery.data.registered,
  );

  useEffect(() => {
    if (isTvPage || dismissed || isSubscribed || !supported || !configQuery.data?.enabled) {
      setVisible(false);
      return;
    }
    const previousCount = Number(sessionStorage.getItem(SESSION_PAGE_COUNT_KEY) || 0);
    const pageCount = previousCount + 1;
    sessionStorage.setItem(SESSION_PAGE_COUNT_KEY, String(pageCount));
    const delay = pageCount >= 2 ? 1_500 : 25_000;
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [configQuery.data?.enabled, dismissed, isSubscribed, isTvPage, location.pathname, supported]);

  const enableMutation = useMutation({
    mutationFn: () => subscribeToPush(configQuery.data?.public_key ?? ''),
    onSuccess: async () => {
      setVisible(false);
      localStorage.removeItem(DISMISSED_AT_KEY);
      await queryClient.invalidateQueries({ queryKey: ['browser-push-subscription'] });
      toast({
        title: 'Известията са включени',
        description: 'Можете да избирате темите от „Известия на устройството“ във footer-а.',
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Известията не са включени', description: error.message, variant: 'destructive' });
    },
  });

  const dismiss = () => {
    localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
    setDismissed(true);
    setVisible(false);
  };

  if (!visible || subscriptionQuery.isLoading || subscriptionQuery.isError) return null;

  const permissionDenied = Notification.permission === 'denied';

  return (
    <aside
      className="fixed bottom-3 left-3 right-3 z-40 max-w-md rounded-2xl border border-primary/25 bg-card/95 p-4 shadow-2xl shadow-slate-950/20 backdrop-blur-xl motion-safe:animate-in motion-safe:slide-in-from-bottom-4 sm:bottom-5 sm:left-5 sm:right-auto sm:p-5"
      aria-label="Включване на известия"
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-2 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Затвори подканата за известия"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="flex items-start gap-3 pr-7">
        <span className="rounded-xl bg-primary/10 p-2.5 text-primary" aria-hidden="true">
          {permissionDenied ? <ShieldCheck className="h-5 w-5" /> : <BellRing className="h-5 w-5" />}
        </span>
        <div>
          <h2 className="font-black text-foreground">Не пропускай важните новини</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {permissionDenied
              ? 'Известията са блокирани. Отворете настройките от иконата до адреса на сайта, разрешете „Известия“ и презаредете страницата.'
              : 'Получавай известия за новини, събития и анкети. Не е необходим профил.'}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 sm:justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={dismiss}>
          {permissionDenied ? 'Разбрах' : 'Не сега'}
        </Button>
        {!permissionDenied && (
          <Button
            type="button"
            size="sm"
            className="gap-2"
            disabled={enableMutation.isPending}
            onClick={() => enableMutation.mutate()}
          >
            {enableMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <BellRing className="h-4 w-4" aria-hidden="true" />
            )}
            Включи известията
          </Button>
        )}
      </div>
    </aside>
  );
}
