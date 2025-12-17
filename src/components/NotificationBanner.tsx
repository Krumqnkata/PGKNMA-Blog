import React from 'react';
import { useNotification } from '@/contexts/NotificationContext';

const NotificationBanner: React.FC = () => {
  const { notifications, notificationsEnabled, isLoading, isError, error } = useNotification();

  if (!notificationsEnabled || isLoading) { 
    return null;
  }

  if (isError) { 
    console.error("Error fetching notifications:", error);
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
        <p key={notification.id} className="text-sm font-medium">
          {notification.text}
        </p>
      ))}
    </div>
  );
};

export default NotificationBanner;
