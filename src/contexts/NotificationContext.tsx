import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getNotifications, Notification } from '@/lib/api'; // Import getNotifications and Notification interface


interface NotificationContextType {
  notifications: Notification[] | undefined; // Can be undefined while loading
  notificationsEnabled: boolean; // Local flag to enable/disable banner display
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  setNotificationsEnabled: (enabled: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use useQuery to fetch notifications from the API
  const { data: notifications, isLoading, isError, error } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 60 * 1000, // Refetch every minute to keep fresh
  });

  // Keep notificationsEnabled as a local flag for the banner if desired
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        notificationsEnabled,
        isLoading,
        isError,
        error,
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
