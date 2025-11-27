import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface Notification {
  id: number;
  text: string;
  enabled: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  notificationsEnabled: boolean;
  addNotification: () => void;
  updateNotificationText: (id: number, text: string) => void;
  toggleNotification: (id: number) => void;
  deleteNotification: (id: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, text: 'Това е уведомление #1 по подразбиране.', enabled: true },
    { id: 2, text: 'Това е уведомление #2 по подразбиране.', enabled: true },
  ]);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  const addNotification = () => {
    const newNotification: Notification = {
      id: Date.now(),
      text: '',
      enabled: true,
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const updateNotificationText = (id: number, text: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, text } : n)
    );
  };

  const toggleNotification = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n)
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        notificationsEnabled,
        addNotification, 
        updateNotificationText, 
        toggleNotification, 
        deleteNotification,
        setNotificationsEnabled
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
