import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Eye, Loader2, LockKeyhole, Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

import { QueryErrorState } from '@/components/query/QueryStates';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  getCurrentProfile,
  type PublicProfileSettings,
  updatePublicProfileSettings,
} from '@/lib/api';
import { publicProfilePath } from '@/lib/public-profile';

const emptySettings: PublicProfileSettings = {
  bio: '',
  public_profile_enabled: true,
  show_email_on_profile: false,
  show_comments_on_profile: true,
};

export default function PublicProfileSettingsCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<PublicProfileSettings>(emptySettings);
  const profileQuery = useQuery({
    queryKey: ['current-profile'],
    queryFn: getCurrentProfile,
  });

  useEffect(() => {
    if (profileQuery.data?.public_profile) {
      setSettings(profileQuery.data.public_profile);
    }
  }, [profileQuery.data?.public_profile]);

  const mutation = useMutation({
    mutationFn: updatePublicProfileSettings,
    onSuccess: async (updated) => {
      setSettings(updated);
      await queryClient.invalidateQueries({ queryKey: ['current-profile'] });
      toast({
        title: 'Публичният профил е обновен',
        description: 'Настройките за видимост са запазени.',
      });
    },
    onError: (error: Error) => toast({
      title: 'Настройките не са запазени',
      description: error.message,
      variant: 'destructive',
    }),
  });

  if (profileQuery.isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  if (profileQuery.isError) {
    return (
      <QueryErrorState
        title="Настройките за публичния профил не могат да бъдат заредени"
        message={profileQuery.error.message}
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  const updateSetting = <Key extends keyof PublicProfileSettings,>(
    key: Key,
    value: PublicProfileSettings[Key],
  ) => setSettings((current) => ({ ...current, [key]: value }));

  return (
    <Card className="overflow-hidden transition-[box-shadow,border-color] duration-300 hover:border-primary/25 hover:shadow-lg">
      <CardHeader className="gap-4 border-b border-border/60 bg-gradient-to-r from-cyan-500/10 to-transparent sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" aria-hidden="true" />
            Публичен профил
          </CardTitle>
          <CardDescription className="mt-1 max-w-2xl">
            Изберете какво да виждат останалите. Имейлът е скрит по подразбиране.
          </CardDescription>
        </div>
        {user?.username && (
          <Button asChild variant="outline" className="w-full shrink-0 sm:w-auto">
            <Link to={publicProfilePath(user.username)}>
              Преглед
              <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6 pt-5 sm:pt-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="public-profile-bio" className="text-sm font-bold">За мен</label>
            <span className="text-xs tabular-nums text-muted-foreground">{settings.bio.length}/500</span>
          </div>
          <Textarea
            id="public-profile-bio"
            value={settings.bio}
            maxLength={500}
            rows={4}
            placeholder="Разкажете накратко за интересите и участието си в училищния живот."
            onChange={(event) => updateSetting('bio', event.target.value)}
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Не публикувайте телефон, адрес или друга чувствителна информация.
          </p>
        </div>

        <div className="divide-y divide-border/60 rounded-2xl border border-border/70">
          <label className="flex cursor-pointer items-center gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Eye className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">Публична профилна страница</span>
              <span className="block text-sm text-muted-foreground">Изключването скрива цялата страница от останалите.</span>
            </span>
            <Switch
              checked={settings.public_profile_enabled}
              onCheckedChange={(checked) => updateSetting('public_profile_enabled', checked)}
              aria-label="Публична профилна страница"
            />
          </label>

          <label className="flex cursor-pointer items-center gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300">
              <Mail className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">Показвай имейла ми</span>
              <span className="block text-sm text-muted-foreground">Включвайте само ако искате всеки посетител да го вижда.</span>
            </span>
            <Switch
              checked={settings.show_email_on_profile}
              disabled={!settings.public_profile_enabled}
              onCheckedChange={(checked) => updateSetting('show_email_on_profile', checked)}
              aria-label="Показвай имейла ми публично"
            />
          </label>

          <label className="flex cursor-pointer items-center gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">Показвай последните ми коментари</span>
              <span className="block text-sm text-muted-foreground">Показват се само коментари към публични публикации.</span>
            </span>
            <Switch
              checked={settings.show_comments_on_profile}
              disabled={!settings.public_profile_enabled}
              onCheckedChange={(checked) => updateSetting('show_comments_on_profile', checked)}
              aria-label="Показвай последните ми коментари"
            />
          </label>
        </div>

        {!settings.public_profile_enabled && (
          <div className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Само вие можете да отваряте профилната си страница, докато тази настройка е изключена.
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end border-t border-border/60 bg-muted/20 pt-5 sm:pt-6">
        <Button
          className="w-full sm:w-auto"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate(settings)}
        >
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          Запази публичния профил
        </Button>
      </CardFooter>
    </Card>
  );
}
