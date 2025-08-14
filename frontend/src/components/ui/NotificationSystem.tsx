import React, { useState, useEffect } from 'react';
import { X, Bell, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss
}) => {
  useEffect(() => {
    notifications.forEach(notification => {
      if (!notification.persistent && notification.duration !== 0) {
        const timer = setTimeout(() => {
          onDismiss(notification.id);
        }, notification.duration || 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onDismiss]);

  const getNotificationConfig = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return {
          icon: Check,
          bgColor: 'bg-emerald-500',
          borderColor: 'border-emerald-400',
          textColor: 'text-white'
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-500',
          borderColor: 'border-red-400',
          textColor: 'text-white'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-amber-500',
          borderColor: 'border-amber-400',
          textColor: 'text-white'
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-500',
          borderColor: 'border-blue-400',
          textColor: 'text-white'
        };
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => {
        const config = getNotificationConfig(notification.type);
        const Icon = config.icon;

        return (
          <div
            key={notification.id}
            className={`${config.bgColor} ${config.borderColor} ${config.textColor} rounded-xl p-4 shadow-lg border-l-4 animate-in slide-in-from-right duration-300`}
          >
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{notification.title}</h4>
                <p className="text-sm opacity-90 mt-1">{notification.message}</p>
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};