import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  archiveNotification,
  archiveReadNotifications,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  Notification,
  type NotificationChannel,
} from '@/lib/api';
import { Archive, Bell, CheckCheck, AlertCircle, Inbox, BellRing, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

const STORAGE_KEY_PREFIX = 'read-notifications-v4';
const ARCHIVE_STORAGE_KEY = 'archived-notifications-v1:public';

// Малка бърза hash функция (djb2), за да не пазим целия html_text
// в localStorage - само "отпечатък" от него. По-леко, по-бързо сравнение.
function hashText(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

type ReadEntry = { hash: string; readAt: number };
type ReadMap = Record<string, ReadEntry>;

const readMapFromStorage = (storageKey: string): ReadMap => {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

type ArchiveMap = Record<string, number>;

const archiveMapFromStorage = (): ArchiveMap => {
  try {
    const saved = localStorage.getItem(ARCHIVE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const NotificationBell: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const storageKey = `${STORAGE_KEY_PREFIX}:${user?.id ?? 'public'}`;
  const notificationQueryKey = useMemo(
    () => ['notifications', user?.id ?? 'public'] as const,
    [user?.id],
  );
  const { data: notifications, isLoading, error, refetch } = useQuery<Notification[], Error>({
    queryKey: notificationQueryKey,
    queryFn: () => getNotifications(),
    enabled: !authLoading,
    refetchInterval: 5 * 60 * 1000,
    retry: 2,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [channel, setChannel] = useState<NotificationChannel>('official');
  const popoverContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement;
      if (popoverContentRef.current && popoverContentRef.current.contains(target)) {
        return;
      }
      setIsOpen(false);
    };
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [isOpen]);

  const [readMap, setReadMap] = useState<ReadMap>({});
  const [archiveMap, setArchiveMap] = useState<ArchiveMap>({});

  useEffect(() => {
    setReadMap(readMapFromStorage(storageKey));
    if (!isAuthenticated) setArchiveMap(archiveMapFromStorage());
    if (!isAuthenticated) {
      setChannel((current) => current === 'gamification' ? 'official' : current);
    }
  }, [isAuthenticated, storageKey]);

  const persistReadMap = useCallback((map: ReadMap) => {
    setReadMap(map);
    try {
      localStorage.setItem(storageKey, JSON.stringify(map));
    } catch {
      // localStorage може да е пълен/недостъпен (напр. private mode) - тихо игнорираме
    }
  }, [storageKey]);

  const persistArchiveMap = useCallback((map: ArchiveMap) => {
    setArchiveMap(map);
    try {
      localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(map));
    } catch {
      // Архивът за анонимни посетители е удобство; при недостъпно
      // localStorage известията просто ще се покажат отново.
    }
  }, []);

  // Синхронизация между отворени табове/прозорци: ако известие се
  // маркира като прочетено в един таб, останалите да се обновят веднага.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey) {
        setReadMap(readMapFromStorage(storageKey));
      }
      if (e.key === ARCHIVE_STORAGE_KEY && !isAuthenticated) {
        setArchiveMap(archiveMapFromStorage());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [isAuthenticated, storageKey]);

  const visibleNotifications = useMemo(() => {
    const notifArray = Array.isArray(notifications) ? notifications : [];
    return notifArray.filter(n => (
      n.enabled
      && !n.is_archived
      && (isAuthenticated || (!n.is_gamification && !archiveMap[n.id]))
    ));
  }, [archiveMap, isAuthenticated, notifications]);

  const officialNotifications = useMemo(
    () => visibleNotifications.filter((notification) => notification.category === 'general'),
    [visibleNotifications],
  );
  const updateNotifications = useMemo(
    () => visibleNotifications.filter((notification) => (
      notification.category !== 'general' && !notification.is_gamification
    )),
    [visibleNotifications],
  );
  const gamificationNotifications = useMemo(
    () => visibleNotifications.filter((notification) => notification.is_gamification),
    [visibleNotifications],
  );
  const enabledNotifications = channel === 'gamification'
    ? gamificationNotifications
    : channel === 'updates'
      ? updateNotifications
      : officialNotifications;

  // Известието е непрочетено ако: никога не е било маркирано,
  // или текущият hash на текста му се различава от последно прочетения
  // (значи текстът е бил редактиран след прочитането)
  const isNotificationUnread = useCallback(
    (n: Notification) => {
      if (isAuthenticated) return !n.is_read;
      const entry = readMap[n.id];
      if (!entry) return true;
      return entry.hash !== hashText(n.html_text);
    },
    [isAuthenticated, readMap]
  );

  const unreadNotifications = useMemo(() => {
    return visibleNotifications.filter(isNotificationUnread);
  }, [visibleNotifications, isNotificationUnread]);

  const unreadCount = unreadNotifications.length;
  const totalCount = visibleNotifications.length;
  const activeUnreadCount = enabledNotifications.filter(isNotificationUnread).length;
  const officialUnreadCount = officialNotifications.filter(isNotificationUnread).length;
  const updateUnreadCount = updateNotifications.filter(isNotificationUnread).length;
  const gamificationUnreadCount = gamificationNotifications.filter(isNotificationUnread).length;

  // Почистваме записи за известия, които вече изобщо не съществуват
  // (нито enabled, нито disabled) - за да не расте localStorage безкрайно.
  // Допълнително: държим таван от записи (най-старите по readAt отпадат първи),
  // в случай че известията идват и си отиват много често с времето.
  const MAX_STORED_ENTRIES = 500;
  useEffect(() => {
    if (!Array.isArray(notifications)) return;
    const existingIds = new Set(notifications.map(n => String(n.id)));

    setReadMap(prev => {
      let entries = Object.entries(prev).filter(([id]) => existingIds.has(id));

      if (entries.length > MAX_STORED_ENTRIES) {
        entries = entries
          .sort((a, b) => b[1].readAt - a[1].readAt)
          .slice(0, MAX_STORED_ENTRIES);
      }

      if (entries.length !== Object.keys(prev).length) {
        const pruned = Object.fromEntries(entries);
        try {
          localStorage.setItem(storageKey, JSON.stringify(pruned));
        } catch {
          // ignore
        }
        return pruned;
      }
      return prev;
    });

    if (!isAuthenticated) {
      setArchiveMap((previous) => {
        let entries = Object.entries(previous).filter(([id]) => existingIds.has(id));
        if (entries.length > MAX_STORED_ENTRIES) {
          entries = entries
            .sort((a, b) => b[1] - a[1])
            .slice(0, MAX_STORED_ENTRIES);
        }
        if (entries.length === Object.keys(previous).length) return previous;

        const pruned = Object.fromEntries(entries);
        try {
          localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(pruned));
        } catch {
          // ignore
        }
        return pruned;
      });
    }
  }, [isAuthenticated, notifications, storageKey]);

  const markCachedNotificationsRead = useCallback((ids: Set<number>) => {
    queryClient.setQueryData<Notification[]>(notificationQueryKey, (current = []) => (
      current.map((notification) => (
        ids.has(notification.id)
          ? { ...notification, is_read: true, read_at: new Date().toISOString() }
          : notification
      ))
    ));
  }, [notificationQueryKey, queryClient]);

  const markOneMutation = useMutation({
    mutationFn: markNotificationRead,
    onMutate: (id) => markCachedNotificationsRead(new Set([id])),
    onError: () => void queryClient.invalidateQueries({ queryKey: notificationQueryKey }),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: () => markCachedNotificationsRead(
      new Set(enabledNotifications.map((notification) => notification.id)),
    ),
    onError: () => void queryClient.invalidateQueries({ queryKey: notificationQueryKey }),
  });

  const archiveOneMutation = useMutation({
    mutationFn: archiveNotification,
    onMutate: (id) => {
      queryClient.setQueryData<Notification[]>(notificationQueryKey, (current = []) => (
        current.filter((notification) => notification.id !== id)
      ));
    },
    onError: () => void queryClient.invalidateQueries({ queryKey: notificationQueryKey }),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const archiveReadMutation = useMutation({
    mutationFn: archiveReadNotifications,
    onMutate: () => {
      const readIds = new Set(
        enabledNotifications
          .filter((notification) => !isNotificationUnread(notification))
          .map((notification) => notification.id),
      );
      queryClient.setQueryData<Notification[]>(notificationQueryKey, (current = []) => (
        current.filter((notification) => !readIds.has(notification.id))
      ));
    },
    onError: () => void queryClient.invalidateQueries({ queryKey: notificationQueryKey }),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // Маркиране на едно известие като прочетено
  const handleMarkOneAsRead = (n: Notification) => {
    if (!isNotificationUnread(n)) return;
    if (isAuthenticated) {
      markOneMutation.mutate(n.id);
      return;
    }
    persistReadMap({
      ...readMap,
      [n.id]: { hash: hashText(n.html_text), readAt: Date.now() },
    });
  };

  // Маркиране на всички като прочетени
  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthenticated) {
      markAllMutation.mutate(channel);
      return;
    }
    const now = Date.now();
    const newMap = { ...readMap };
    enabledNotifications.forEach(n => {
      newMap[n.id] = { hash: hashText(n.html_text), readAt: now };
    });
    persistReadMap(newMap);
  };

  const handleArchiveOne = (notification: Notification, event: React.MouseEvent) => {
    event.stopPropagation();
    if (isAuthenticated) {
      archiveOneMutation.mutate(notification.id);
      return;
    }
    persistArchiveMap({ ...archiveMap, [notification.id]: Date.now() });
  };

  const readNotifications = enabledNotifications.filter(
    (notification) => !isNotificationUnread(notification),
  );

  const handleArchiveRead = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isAuthenticated) {
      archiveReadMutation.mutate(channel);
      return;
    }
    const archivedAt = Date.now();
    const nextArchiveMap = { ...archiveMap };
    readNotifications.forEach((notification) => {
      nextArchiveMap[notification.id] = archivedAt;
    });
    persistArchiveMap(nextArchiveMap);
  };

  const openNotificationAction = (notification: Notification) => {
    handleMarkOneAsRead(notification);
    if (!notification.action_url) return;

    setIsOpen(false);
    if (notification.action_url.startsWith('/') && !notification.action_url.startsWith('//')) {
      navigate(notification.action_url);
      return;
    }
    if (/^https:\/\//i.test(notification.action_url)) {
      window.location.assign(notification.action_url);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('bg-BG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <>
      <style>{`
        @keyframes bell-ring {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(-12deg); }
          20% { transform: rotate(10deg); }
          30% { transform: rotate(-8deg); }
          40% { transform: rotate(6deg); }
          50% { transform: rotate(-4deg); }
          60% { transform: rotate(2deg); }
          70%, 100% { transform: rotate(0deg); }
        }
        .animate-bell-ring {
          transform-origin: top center;
          animation: bell-ring 1.5s ease-in-out infinite;
        }
      `}</style>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative rounded-full text-white/85 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Известия"
          >
            {unreadCount > 0 ? (
              <BellRing className="h-5 w-5 animate-bell-ring text-white" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
            {totalCount > 0 && (
              <span 
                className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-[#0a2e2e] transition-colors animate-in zoom-in ${
                  unreadCount > 0 ? 'bg-destructive' : 'bg-emerald-500'
                }`}
              >
                {unreadCount > 0 ? unreadCount : totalCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent ref={popoverContentRef} className="w-80 sm:w-96 p-0 border border-border bg-popover text-popover-foreground shadow-2xl rounded-xl overflow-hidden z-50" align="end">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm tracking-wide">Известия</h4>
              {activeUnreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/20 text-primary rounded-full">
                  {activeUnreadCount} нови
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {readNotifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                  onClick={handleArchiveRead}
                  disabled={archiveReadMutation.isPending}
                  aria-label="Архивирай прочетените"
                  title="Архивирай прочетените"
                >
                  <Archive className="h-3.5 w-3.5" />
                </Button>
              )}
              {activeUnreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-primary gap-1 transition-colors rounded-md"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllMutation.isPending}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Прочети всички</span>
                </Button>
              )}
            </div>
          </div>

          <div
            className={cn(
              'grid gap-1 border-b border-border bg-muted/20 p-1.5',
              isAuthenticated ? 'grid-cols-3' : 'grid-cols-2',
            )}
            role="tablist"
            aria-label="Вид известия"
          >
              <button
                type="button"
                role="tab"
                aria-selected={channel === 'official'}
                aria-label={`Официални: ${officialNotifications.length} общо, ${officialUnreadCount} непрочетени`}
                onClick={() => setChannel('official')}
                className={cn('min-w-0 rounded-lg px-1.5 py-2 text-[11px] font-bold transition-colors sm:px-2 sm:text-xs', channel === 'official' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
              >
                <span className="block truncate">Официални</span>
                <span className="mt-1 flex items-center justify-center gap-1 text-[9px] font-semibold leading-none sm:text-[10px]">
                  <span className="opacity-75">{officialNotifications.length} общо</span>
                  {officialUnreadCount > 0 && (
                    <span className="rounded-full bg-destructive px-1.5 py-0.5 text-white">
                      {officialUnreadCount} нови
                    </span>
                  )}
                </span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={channel === 'updates'}
                aria-label={`Актуализации: ${updateNotifications.length} общо, ${updateUnreadCount} непрочетени`}
                onClick={() => setChannel('updates')}
                className={cn('min-w-0 rounded-lg px-1.5 py-2 text-[11px] font-bold transition-colors sm:px-2 sm:text-xs', channel === 'updates' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
              >
                <span className="block truncate">Актуализации</span>
                <span className="mt-1 flex items-center justify-center gap-1 text-[9px] font-semibold leading-none sm:text-[10px]">
                  <span className="opacity-75">{updateNotifications.length} общо</span>
                  {updateUnreadCount > 0 && (
                    <span className="rounded-full bg-destructive px-1.5 py-0.5 text-white">
                      {updateUnreadCount} нови
                    </span>
                  )}
                </span>
              </button>
              {isAuthenticated && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={channel === 'gamification'}
                  aria-label={`Постижения: ${gamificationNotifications.length} общо, ${gamificationUnreadCount} непрочетени`}
                  onClick={() => setChannel('gamification')}
                  className={cn('min-w-0 rounded-lg px-1.5 py-2 text-[11px] font-bold transition-colors sm:px-2 sm:text-xs', channel === 'gamification' ? 'bg-violet-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                >
                  <span className="block truncate">Постижения</span>
                  <span className="mt-1 flex items-center justify-center gap-1 text-[9px] font-semibold leading-none sm:text-[10px]">
                    <span className="opacity-75">{gamificationNotifications.length} общо</span>
                    {gamificationUnreadCount > 0 && (
                      <span className="rounded-full bg-destructive px-1.5 py-0.5 text-white">
                        {gamificationUnreadCount} нови
                      </span>
                    )}
                  </span>
                </button>
              )}
          </div>

          {isLoading ? (
            <div role="status" aria-label="Зареждане на известията" className="space-y-4 p-4">
              {[1, 2, 3].map((item) => <div key={item} className="space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-full" /></div>)}
              <span className="sr-only">Зареждане на известията</span>
            </div>
          ) : error ? (
            <div role="alert" className="flex flex-col items-center gap-2 px-4 py-6 text-center text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Неуспешно зареждане на известия.</span>
              <Button type="button" size="sm" variant="outline" onClick={() => void refetch()}>Опитай отново</Button>
            </div>
          ) : enabledNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-2">
              <div className="p-3 bg-muted rounded-full text-muted-foreground/60">
                <Inbox className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Няма известия</p>
              <p className="text-xs text-muted-foreground/80 max-w-[200px]">Всичко е актуално към момента.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[350px] overflow-y-auto">
              <div className="divide-y divide-border/60">
                {enabledNotifications.map((notification) => {
                  const isUnread = isNotificationUnread(notification);
                  return (
                    <div 
                      key={notification.id} 
                      onClick={() => notification.action_url ? openNotificationAction(notification) : handleMarkOneAsRead(notification)}
                      onKeyDown={(event) => {
                        if ((event.key === 'Enter' || event.key === ' ') && notification.action_url) {
                          event.preventDefault();
                          openNotificationAction(notification);
                        }
                      }}
                      role={notification.action_url ? 'link' : undefined}
                      tabIndex={notification.action_url ? 0 : undefined}
                      className={`relative p-4 flex gap-3 transition-colors duration-200 hover:bg-accent/40 ${isUnread ? 'bg-primary/5' : ''} ${notification.action_url || isUnread ? 'cursor-pointer' : ''}`}
                    >
                      {isUnread && (
                        <span className="absolute left-1.5 top-5 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.8)] animate-pulse" />
                      )}
                      <div className="flex-1 space-y-1 pl-1">
                        <MarkdownRenderer 
                          content={notification.html_text || notification.text || ''} 
                          className="text-sm leading-relaxed prose prose-sm dark:prose-invert break-words max-w-full [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80"
                        />
                        {notification.created_at && (
                          <p className="text-[10px] text-muted-foreground/80">
                            {formatDate(notification.created_at)}
                          </p>
                        )}
                      </div>
                      <div className="mt-0.5 flex shrink-0 flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={(event) => handleArchiveOne(notification, event)}
                          title="Архивирай известието"
                          aria-label="Архивирай известието"
                          disabled={archiveOneMutation.isPending}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                        {isUnread && !notification.action_url && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkOneAsRead(notification);
                            }}
                            title="Маркирай като прочетено"
                            aria-label="Маркирай като прочетено"
                            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-primary/10 hover:text-primary"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {notification.action_url && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
};

export default NotificationBell;
