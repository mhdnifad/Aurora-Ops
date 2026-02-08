'use client';

import { useEffect, useState } from 'react';
import { Bell, Circle, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '@/lib/socket-context';

export function RealtimeIndicators() {
  const { socket, isConnected } = useSocket();
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; timestamp: Date }>>([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for notifications
    const handleNotification = (data: any) => {
      const notification = {
        id: Math.random().toString(36),
        message: data.message || 'New update',
        timestamp: new Date(),
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 5));
      setNotificationCount((prev) => prev + 1);
    };

    socket.on('notification:new', handleNotification);
    socket.on('notifications:load', (payload: { notifications?: any[] }) => {
      if (Array.isArray(payload?.notifications)) {
        const initial = payload.notifications.map((item) => ({
          id: item._id || Math.random().toString(36),
          message: item.message || item.title || 'New update',
          timestamp: new Date(item.createdAt || Date.now()),
        }));
        setNotifications(initial.slice(0, 5));
        setNotificationCount(initial.length);
      }
    });
    socket.on('task:updated', () => handleNotification({ message: 'Task updated' }));
    socket.on('project:updated', () => handleNotification({ message: 'Project updated' }));
    socket.on('user:joined', () => handleNotification({ message: 'A user joined the project' }));

    return () => {
      socket.off('notification:new', handleNotification);
      socket.off('notifications:load');
      socket.off('task:updated', handleNotification);
      socket.off('project:updated', handleNotification);
      socket.off('user:joined', handleNotification);
    };
  }, [socket]);

  return (
    <div className="flex items-center gap-3">
      {/* Connection Status */}
      <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg backdrop-blur-sm bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-600 dark:text-green-400">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium text-red-600 dark:text-red-400">Disconnected</span>
          </>
        )}
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-lg backdrop-blur-sm bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all"
        >
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-2xl z-50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-600 dark:text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 hover:bg-white/10 transition-colors">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{notif.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {notif.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function OnlineIndicator() {
  const { socket, isConnected } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const handleUsersCount = (count: number) => {
      setOnlineUsers(count);
    };

    socket.on('online_users_count', handleUsersCount);

    return () => {
      socket.off('online_users_count', handleUsersCount);
    };
  }, [socket]);

  if (!isConnected || onlineUsers === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm bg-green-500/20 dark:bg-green-500/10 border border-green-500/40 dark:border-green-500/30">
      <Circle className="w-2 h-2 fill-green-500 text-green-500" />
      <span className="text-xs font-medium text-green-700 dark:text-green-400">
        {onlineUsers} online
      </span>
    </div>
  );
}
