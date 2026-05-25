import React, { useState, useRef, useLayoutEffect } from 'react';
import { useGlobalState } from '@/contexts/GlobalStateContext';
import { ChevronDown, ChevronUp, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotificationBanner: React.FC = () => {
  const { notifications: { data: notifications, isLoading, isError, error }, notificationsEnabled } = useGlobalState();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [placeholderHeight, setPlaceholderHeight] = useState<number | undefined>(undefined);
  
  const firstItemRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const enabledNotifications = notifications ? notifications.filter(n => n.enabled) : [];
  const notificationCount = enabledNotifications.length;

  useLayoutEffect(() => {
    // Detect truncation for the first item
    if (firstItemRef.current && !isExpanded) {
      const isContentTruncated = firstItemRef.current.scrollHeight > firstItemRef.current.clientHeight;
      setIsTruncated(isContentTruncated);
    }
  }, [enabledNotifications, isExpanded]);

  useLayoutEffect(() => {
    // Measure and set placeholder height based on collapsed state
    if (!isExpanded && bannerRef.current) {
      setPlaceholderHeight(bannerRef.current.offsetHeight);
    }
  }, [enabledNotifications, isExpanded, isTruncated]);

  if (!notificationsEnabled || isLoading) { 
    return null;
  }

  if (isError) { 
    console.error("Грешка при извличане на известия:", error);
    return (
        <div className="bg-destructive text-destructive-foreground text-center py-2">
            <p className="text-sm font-medium">Грешка при зареждане на известия.</p>
        </div>
    );
  }

  if (notificationCount === 0) {
    return null;
  }

  const itemsToShow = isExpanded ? enabledNotifications : enabledNotifications.slice(0, 1);

  return (
    <div className="relative w-full overflow-visible" style={{ height: placeholderHeight ? `${placeholderHeight}px` : 'auto' }}>
      <div 
        ref={bannerRef}
        className={`bg-accent text-accent-foreground text-center py-2 px-4 w-full transition-all duration-300 ease-in-out ${isExpanded ? 'absolute top-0 left-0 z-[60] shadow-xl border-b border-accent-foreground/10' : 'relative'}`}
      >
        <div className="space-y-2">
          {itemsToShow.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <div 
                ref={index === 0 ? firstItemRef : null}
                className={`text-sm font-medium ${!isExpanded ? 'line-clamp-1' : ''}`}
                dangerouslySetInnerHTML={{ __html: notification.html_text }}
              />
              {isExpanded && index < itemsToShow.length - 1 && (
                <hr className="border-t border-accent-foreground/30 my-1" />
              )}
            </React.Fragment>
          ))}
        </div>

        {(notificationCount > 1 || isTruncated) && (
          <div className="mt-2">
              <Button
                variant="link"
                className="text-xs h-auto p-0"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    Скрий известията <ChevronUp className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    <Bell className="mr-1 h-4 w-4" /> Покажи известията {notificationCount > 1 && `(${notificationCount})`} <ChevronDown className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
        )}
      </div>
    </div>
  );
};

export default NotificationBanner;
