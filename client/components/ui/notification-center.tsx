'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, AlertCircle, CheckCircle, Info, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRealtimeNotifications } from '@/lib/socket-hooks-enhanced';
import { toast } from 'sonner';
import { useT } from '@/lib/useT';

export default function NotificationCenter() {
  const { notifications, clearNotification, clearAll } = useRealtimeNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const lastCountRef = useRef(0);
  const t = useT();

  // Surface incoming notifications as toasts for quick visibility
  useEffect(() => {
    if (notifications.length > lastCountRef.current) {
      const latest = notifications[0];
      if (latest) {
        toast(latest.title || 'Notification', {
          description: latest.message,
        });
      }
    }
    lastCountRef.current = notifications.length;
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" title={t('common.success')} />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" title={t('common.error')} />;
      case 'warning':
        return <Zap className="w-5 h-5 text-orange-600" title={t('common.error')} />;
      default:
        return <Info className="w-5 h-5 text-blue-600" title={t('common.success')} />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border-l-4 border-green-600 hover:from-green-100 hover:to-green-100/50 dark:hover:from-green-800/30 dark:hover:to-green-700/20';
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border-l-4 border-red-600 hover:from-red-100 hover:to-red-100/50 dark:hover:from-red-800/30 dark:hover:to-red-700/20';
      case 'warning':
        return 'bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 border-l-4 border-orange-600 hover:from-orange-100 hover:to-orange-100/50 dark:hover:from-orange-800/30 dark:hover:to-orange-700/20';
      default:
        return 'bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-l-4 border-blue-600 hover:from-blue-100 hover:to-blue-100/50 dark:hover:from-blue-800/30 dark:hover:to-blue-700/20';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {Math.min(notifications.length, 9)}
          </span>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto backdrop-blur-2xl bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
            <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('common.success')}</h3>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
              >
                {t('common.delete')}
              </Button>
            )}
          </div>

          <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
            {notifications.length > 0 ? (
              notifications.map((notif: any) => (
                <div
                  key={notif._id}
                  className={`p-4 flex gap-3 items-start transition-all duration-300 ${getNotificationBg(
                    notif.type
                  )}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {new Date(notif.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => clearNotification(notif._id)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5 p-1 rounded transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3 opacity-50" />
                <p className="text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
