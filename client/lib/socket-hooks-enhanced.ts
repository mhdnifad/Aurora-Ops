import { useEffect, useState } from 'react';
import { useSocket } from './socket-context';

export function useRealtimeNotifications() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification: any) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket]);

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    clearNotification,
    clearAll,
  };
}

export function useRealtimeStats() {
  const { socket } = useSocket();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!socket) return;

    const handleStatsUpdate = (newStats: any) => {
      setStats(newStats);
    };

    socket.on('stats:update', handleStatsUpdate);
    socket.emit('stats:subscribe');

    return () => {
      socket.off('stats:update', handleStatsUpdate);
      socket.emit('stats:unsubscribe');
    };
  }, [socket]);

  return stats;
}

export function useRealtimeTasks() {
  const { socket } = useSocket();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = (task: any) => {
      setTasks((prev) => [task, ...prev]);
    };

    const handleTaskUpdated = (task: any) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, ...task } : t))
      );
    };

    const handleTaskDeleted = (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    };

    const handleTasksLoaded = (loadedTasks: any[]) => {
      setTasks(loadedTasks);
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('tasks:loaded', handleTasksLoaded);
    
    // Subscribe to task updates
    socket.emit('tasks:subscribe');

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('tasks:loaded', handleTasksLoaded);
      socket.emit('tasks:unsubscribe');
    };
  }, [socket]);

  return tasks.length > 0 ? tasks : null;
}
