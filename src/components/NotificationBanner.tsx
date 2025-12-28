import React, { useState } from 'react';
import { useGlobalState } from '@/contexts/GlobalStateContext';
import { ChevronDown, ChevronUp, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotificationBanner: React.FC = () => {
  const { notifications: { data: notifications, isLoading, isError, error }, notificationsEnabled } = useGlobalState();
  const [isExpanded, setIsExpanded] = useState(false);

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

  const enabledNotifications = notifications ? notifications.filter(n => n.enabled) : [];
  const notificationCount = enabledNotifications.length;

  if (notificationCount === 0) {
    return null;
  }

  const itemsToShow = isExpanded ? enabledNotifications : enabledNotifications.slice(0, 1);

  return (
    <div className="bg-accent text-accent-foreground text-center py-2 px-4">
      <div className="space-y-2">
        {itemsToShow.map((notification, index) => (
          <React.Fragment key={notification.id}>
            <p 
              className={`text-sm font-medium ${!isExpanded && notificationCount > 1 ? 'line-clamp-1' : ''}`}
              dangerouslySetInnerHTML={{ __html: notification.html_text }}
            />
            {isExpanded && index < itemsToShow.length - 1 && (
              <hr className="border-t border-accent-foreground/30 my-1" />
            )}
          </React.Fragment>
        ))}
      </div>

      {notificationCount > 1 && (
        <div className="mt-2">
            <Button
              variant="link"
              className="text-xs h-auto p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  Скрий <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  <Bell className="mr-1 h-4 w-4" /> Покажи всички ({notificationCount}) <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
      )}
    </div>
  );
};

export default NotificationBanner;
