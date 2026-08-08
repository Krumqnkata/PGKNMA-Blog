import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Clock3,
  KeyRound,
  Laptop,
  Loader2,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

import {
  BlogLoginSession,
  getBlogLoginSessions,
  revokeBlogLoginSession,
  revokeOtherBlogLoginSessions,
} from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const formatDateTime = (value: string) => new Intl.DateTimeFormat('bg-BG', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value));

const statusLabel = (session: BlogLoginSession) => {
  if (session.is_current) return 'Това устройство';
  if (session.status === 'active') return 'Активна';
  if (session.status === 'expired') return 'Изтекла';
  return 'Прекратена';
};

const LoginSessions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<BlogLoginSession | null>(null);
  const [confirmOthers, setConfirmOthers] = useState(false);

  const sessionsQuery = useQuery({
    queryKey: ['blog-login-sessions'],
    queryFn: getBlogLoginSessions,
  });

  const refreshSessions = () => queryClient.invalidateQueries({
    queryKey: ['blog-login-sessions'],
  });

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => revokeBlogLoginSession(sessionId),
    onSuccess: async (data) => {
      setSelectedSession(null);
      await refreshSessions();
      toast({ title: 'Сесията е прекратена', description: data.detail });
    },
    onError: (error: Error) => toast({
      title: 'Грешка',
      description: error.message,
      variant: 'destructive',
    }),
  });

  const revokeOthersMutation = useMutation({
    mutationFn: revokeOtherBlogLoginSessions,
    onSuccess: async (data) => {
      setConfirmOthers(false);
      await refreshSessions();
      toast({
        title: 'Другите сесии са прекратени',
        description: data.revoked_count
          ? `Прекратени сесии: ${data.revoked_count}.`
          : 'Няма други активни сесии.',
      });
    },
    onError: (error: Error) => toast({
      title: 'Грешка',
      description: error.message,
      variant: 'destructive',
    }),
  });

  if (sessionsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-52 w-full" />
      </div>
    );
  }

  if (sessionsQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Историята не може да бъде заредена</AlertTitle>
        <AlertDescription className="mt-3 space-y-3">
          <p>{sessionsQuery.error.message}</p>
          <Button variant="outline" onClick={() => sessionsQuery.refetch()}>
            Опитай отново
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const sessions = sessionsQuery.data || [];
  const hasOtherActiveSessions = sessions.some(
    (session) => session.status === 'active' && !session.is_current,
  );

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="gap-3 border-b border-border/60 bg-gradient-to-r from-primary/10 to-transparent sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle>Сесии и входове</CardTitle>
            <CardDescription>
              Тук виждате настоящите и последните входове в профила си. IP адресите
              и мрежовият оператор се пазят ограничено за сигурност.
            </CardDescription>
          </div>
          <Button
            variant="destructive"
            className="w-full shrink-0 sm:w-auto"
            disabled={!hasOtherActiveSessions || revokeOthersMutation.isPending}
            onClick={() => setConfirmOthers(true)}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Прекрати всички други
          </Button>
        </CardHeader>
      </Card>

      {sessions.length === 0 ? (
        <Alert>
          <AlertTitle>Няма запазена история</AlertTitle>
          <AlertDescription>Все още няма налични записи за вход.</AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card key={session.id} className={`transition-[box-shadow,border-color] duration-300 hover:shadow-md ${session.is_current ? 'border-primary/60 bg-primary/[0.02]' : 'hover:border-primary/25'}`}>
              <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
                    <Laptop className="h-5 w-5 shrink-0" />
                    <span>{session.device_label || 'Неизвестно устройство'}</span>
                    <Badge
                      variant={session.status === 'revoked' ? 'destructive' : session.status === 'expired' ? 'outline' : 'default'}
                    >
                      {statusLabel(session)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Вход с {session.auth_method_display.toLowerCase()}
                  </CardDescription>
                </div>
                {session.status === 'active' && !session.is_current && (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => setSelectedSession(session)}
                  >
                    Прекрати
                  </Button>
                )}
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                <div className="flex min-w-0 items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-muted-foreground">Мрежа</p>
                    <p className="break-words font-medium">
                      {session.ip_address || 'Няма IP'}
                      {session.network_operator ? ` · ${session.network_operator}` : ''}
                      {session.network_asn ? ` (AS${session.network_asn})` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Вход</p>
                    <p className="font-medium">{formatDateTime(session.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Последна активност</p>
                    <p className="font-medium">{formatDateTime(session.last_seen_at)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Срок / причина</p>
                    <p className="font-medium">
                      {session.revoked_reason_display || `До ${formatDateTime(session.expires_at)}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={selectedSession !== null} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Прекратяване на сесия</AlertDialogTitle>
            <AlertDialogDescription>
              Устройството „{selectedSession?.device_label || 'Неизвестно устройство'}“
              ще бъде отписано веднага. Действието не може да бъде отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedSession && revokeMutation.mutate(selectedSession.id)}
              disabled={revokeMutation.isPending}
            >
              {revokeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Прекрати
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmOthers} onOpenChange={setConfirmOthers}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Прекратяване на всички други сесии</AlertDialogTitle>
            <AlertDialogDescription>
              Всички други устройства ще бъдат отписани веднага. Тази сесия ще остане активна.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => revokeOthersMutation.mutate()}
              disabled={revokeOthersMutation.isPending}
            >
              {revokeOthersMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Прекрати другите
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LoginSessions;
