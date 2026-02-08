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

    socket.on('notification:new', handleNotification);
    socket.on('notifications:load', (payload: { notifications?: any[] }) => {
      if (Array.isArray(payload?.notifications)) {
        setNotifications(payload.notifications);
      }
    });

    return () => {
      socket.off('notification:new', handleNotification);
      socket.off('notifications:load');
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
    setTasks([]);
    if (!socket) return;

    const handleTaskCreated = (task: any) => {
      const payload = task?.task || task;
      setTasks((prev) => [payload, ...prev]);
    };

    const handleTaskUpdated = (payload: any) => {
      if (payload?.taskId && payload?.updates) {
        setTasks((prev) =>
          prev.map((t) => (t._id === payload.taskId ? { ...t, ...payload.updates } : t))
        );
        return;
      }

      const task = payload?.task || payload;
      if (!task?._id) {
        return;
      }

      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, ...task } : t))
      );
    };

    const handleTaskDeleted = (payload: any) => {
      const taskId = payload?.taskId || payload;
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

export function useRealtimeProjects() {
  const { socket } = useSocket();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    setProjects([]);
    if (!socket) return;

    const upsertProject = (payload: any) => {
      const project = payload?.project || payload;
      if (!project?._id) {
        return;
      }

      setProjects((prev) => {
        const existingIndex = prev.findIndex((p) => p._id === project._id);
        if (existingIndex === -1) {
          return [project, ...prev];
        }

        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...project };
        return updated;
      });
    };

    const removeProject = (payload: any) => {
      const projectId = payload?.projectId || payload?._id || payload;
      if (!projectId) {
        return;
      }
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
    };

    socket.on('project:created', upsertProject);
    socket.on('project:updated', upsertProject);
    socket.on('project:archived', upsertProject);
    socket.on('project:unarchived', upsertProject);
    socket.on('project:deleted', removeProject);

    return () => {
      socket.off('project:created', upsertProject);
      socket.off('project:updated', upsertProject);
      socket.off('project:archived', upsertProject);
      socket.off('project:unarchived', upsertProject);
      socket.off('project:deleted', removeProject);
    };
  }, [socket]);

  return projects.length > 0 ? projects : null;
}

export function useTypingPresence(taskId?: string, projectId?: string) {
  const { socket } = useSocket();
  const [typingUsers, setTypingUsers] = useState<Array<{ userId: string; email?: string; lastSeen: number }>>([]);

  useEffect(() => {
    if (!socket || !taskId || !projectId) return;

    const upsertTypingUser = (payload: any) => {
      if (payload?.taskId !== taskId) return;
      const userId = payload?.userId;
      if (!userId) return;

      setTypingUsers((prev) => {
        const now = Date.now();
        const existingIndex = prev.findIndex((entry) => entry.userId === userId);
        if (existingIndex === -1) {
          return [...prev, { userId, email: payload?.email, lastSeen: now }];
        }
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], email: payload?.email, lastSeen: now };
        return updated;
      });
    };

    const removeTypingUser = (payload: any) => {
      if (payload?.taskId !== taskId) return;
      const userId = payload?.userId;
      if (!userId) return;
      setTypingUsers((prev) => prev.filter((entry) => entry.userId !== userId));
    };

    socket.on('user:typing', upsertTypingUser);
    socket.on('user:stop-typing', removeTypingUser);

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => prev.filter((entry) => now - entry.lastSeen < 4000));
    }, 2000);

    return () => {
      socket.off('user:typing', upsertTypingUser);
      socket.off('user:stop-typing', removeTypingUser);
      window.clearInterval(intervalId);
    };
  }, [socket, taskId, projectId]);

  const emitTyping = () => {
    if (!socket || !taskId || !projectId) return;
    socket.emit('typing', { taskId, projectId });
  };

  const emitStopTyping = () => {
    if (!socket || !taskId || !projectId) return;
    socket.emit('stop-typing', { taskId, projectId });
  };

  return {
    typingUsers: typingUsers.map(({ userId, email }) => ({ userId, email })),
    emitTyping,
    emitStopTyping,
  };
}
