import React from 'react';
import { useGlobalState } from '@/contexts/GlobalStateContext';

const NotificationBanner: React.FC = () => {
  const { notifications: { data: notifications, isLoading, isError, error }, notificationsEnabled } = useGlobalState();

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

  if (enabledNotifications.length === 0) {
    return null;
  }

  return (
    <div className="bg-accent text-accent-foreground text-center py-2">
      {enabledNotifications.map(notification => (
        <p 
          key={notification.id} 
          className="text-sm font-medium"
          dangerouslySetInnerHTML={{ __html: notification.html_text }}
        />
      ))}
    </div>
  );
};

export default NotificationBanner;
