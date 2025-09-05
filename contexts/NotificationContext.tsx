import React, { createContext, useState, useContext, ReactNode } from 'react';
import Toast, { NotificationType } from '../components/ui/Toast';

interface INotificationContext {
  showNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<INotificationContext | undefined>(undefined);

interface NotificationState {
  message: string;
  type: NotificationType;
  key: number;
}

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = (message: string, type: NotificationType) => {
    setNotification({ message, type, key: Date.now() });
  };

  const handleClose = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <Toast
          key={notification.key}
          message={notification.message}
          type={notification.type}
          onClose={handleClose}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): INotificationContext => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
