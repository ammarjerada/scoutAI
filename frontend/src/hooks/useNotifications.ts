import { useState, useCallback } from 'react';
import { Notification } from '../components/ui/NotificationSystem';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    options?: { duration?: number; persistent?: boolean }
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration: options?.duration,
      persistent: options?.persistent
    };

    setNotifications(prev => [...prev, notification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = useCallback((title: string, message: string, options?: { duration?: number }) => {
    return addNotification('success', title, message, options);
  }, [addNotification]);

  const error = useCallback((title: string, message: string, options?: { duration?: number; persistent?: boolean }) => {
    return addNotification('error', title, message, options);
  }, [addNotification]);

  const warning = useCallback((title: string, message: string, options?: { duration?: number }) => {
    return addNotification('warning', title, message, options);
  }, [addNotification]);

  const info = useCallback((title: string, message: string, options?: { duration?: number }) => {
    return addNotification('info', title, message, options);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };
};