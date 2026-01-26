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
        return 'bg-green-50 border-l-4 border-green-600';
      case 'error':
        return 'bg-red-50 border-l-4 border-red-600';
      case 'warning':
        return 'bg-orange-50 border-l-4 border-orange-600';
      default:
        return 'bg-blue-50 border-l-4 border-blue-600';
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
        <Card className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto shadow-xl border-0 z-50">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{t('common.success')}</h3>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {t('common.delete')}
              </Button>
            )}
          </div>

          <div className="divide-y">
            {notifications.length > 0 ? (
              notifications.map((notif: any) => (
                <div
                  key={notif._id}
                  className={`p-4 flex gap-3 items-start hover:bg-gray-50 transition-colors ${getNotificationBg(
                    notif.type
                  )}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{notif.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notif.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => clearNotification(notif._id)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t('common.loading')}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
