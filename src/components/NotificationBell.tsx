import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGlobalState } from '@/contexts/GlobalStateContext';
import { Bell, CheckCheck, AlertCircle, Inbox, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

const NotificationBell: React.FC = () => {
  const { 
    notifications: { data: notifications, isLoading, error }, 
    notificationsEnabled 
  } = useGlobalState();

  const [isOpen, setIsOpen] = useState(false);
  const popoverContentRef = useRef<HTMLDivElement>(null);

  // Close popover on scroll (ignoring scrolls within the popover itself)
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
  
  // Track read notification IDs in localStorage to show the correct badge count
  const [readIds, setReadIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('seen-notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filter enabled notifications
  const enabledNotifications = useMemo(() => {
    return notifications ? notifications.filter(n => n.enabled) : [];
  }, [notifications]);

  // Count of unread notifications
  const unreadNotifications = useMemo(() => {
    return enabledNotifications.filter(n => !readIds.includes(n.id));
  }, [enabledNotifications, readIds]);

  const unreadCount = unreadNotifications.length;
  const totalCount = enabledNotifications.length;

  // Track the read state at the moment the popover was opened
  // so that unread items don't lose their styling immediately while the user is reading them.
  const [openedReadIds, setOpenedReadIds] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      setOpenedReadIds(readIds);
    } else {
      // Mark all current enabled notifications as read when the popover closes
      if (enabledNotifications.length > 0) {
        const currentIds = enabledNotifications.map(n => n.id);
        const newReadIds = Array.from(new Set([...readIds, ...currentIds]));
        setReadIds(newReadIds);
        localStorage.setItem('seen-notifications', JSON.stringify(newReadIds));
      }
    }
    // We intentionally omit readIds from dependencies because we only want to capture
    // its value when the popover opens or notifications list updates, not when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, enabledNotifications]);

  // Mark all as read manually
  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIds = enabledNotifications.map(n => n.id);
    const newReadIds = Array.from(new Set([...readIds, ...currentIds]));
    setReadIds(newReadIds);
    localStorage.setItem('seen-notifications', JSON.stringify(newReadIds));
    // Also update openedReadIds immediately to clear visual indicators
    setOpenedReadIds(newReadIds);
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

  if (!notificationsEnabled) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-full text-white/85 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Известия"
        >
          {totalCount > 0 ? (
            <BellRing className="h-5 w-5 animate-pulse text-white" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-[#0a2e2e] transition-transform animate-in zoom-in">
              {totalCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent ref={popoverContentRef} className="w-80 sm:w-96 p-0 border border-border bg-popover text-popover-foreground shadow-2xl rounded-xl overflow-hidden z-50" align="end">
        {/* Popover Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm tracking-wide">Известия</h4>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/20 text-primary rounded-full">
                {unreadCount} нови
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs text-muted-foreground hover:text-primary gap-1 transition-colors rounded-md"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Прочети всички</span>
            </Button>
          )}
        </div>

        {/* Popover Body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-xs text-muted-foreground">Зареждане...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 px-4 py-6 text-destructive text-sm justify-center">
            <AlertCircle className="h-4 w-4" />
            <span>Неуспешно зареждане на известия.</span>
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
                const isUnread = !openedReadIds.includes(notification.id);
                return (
                  <div 
                    key={notification.id} 
                    className={`relative p-4 flex gap-3 transition-colors duration-200 hover:bg-accent/40 ${isUnread ? 'bg-primary/5' : ''}`}
                  >
                    {/* Unread indicator dot */}
                    {isUnread && (
                      <span className="absolute left-1.5 top-5 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.8)] animate-pulse" />
                    )}
                    
                    <div className="flex-1 space-y-1 pl-1">
                      <div 
                        className="text-sm leading-relaxed prose prose-sm dark:prose-invert break-words max-w-full [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80"
                        dangerouslySetInnerHTML={{ __html: notification.html_text }}
                      />
                      {notification.created_at && (
                        <p className="text-[10px] text-muted-foreground/80">
                          {formatDate(notification.created_at)}
                        </p>
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
  );
};

export default NotificationBell;
