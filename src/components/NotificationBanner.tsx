import React from 'react';
import { useNotification } from '@/contexts/NotificationContext';

const NotificationBanner: React.FC = () => {
  const { notifications, notificationsEnabled } = useNotification();

  const enabledNotifications = notifications.filter(n => n.enabled);

  if (!notificationsEnabled || enabledNotifications.length === 0) {
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
