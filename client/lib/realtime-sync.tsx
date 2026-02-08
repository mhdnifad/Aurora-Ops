'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from './socket-context';
import { useAuth } from './auth-context';

const upsertById = <T extends Record<string, any>>(list: T[], item: T, idKey: string = '_id') => {
  const id = item?.[idKey];
  if (!id) {
    return list;
  }

  const index = list.findIndex((entry) => entry?.[idKey] === id);
  if (index === -1) {
    return [item, ...list];
  }

  const updated = [...list];
  updated[index] = { ...updated[index], ...item };
  return updated;
};

const removeById = <T extends Record<string, any>>(list: T[], id: string, idKey: string = '_id') => {
  if (!id) {
    return list;
  }
  return list.filter((entry) => entry?.[idKey] !== id);
};

export function RealtimeSync() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket) return;

    const handleProjectUpsert = (payload: any) => {
      const project = payload?.project || payload;
      if (!project?._id) return;

      queryClient.setQueriesData({ predicate: (query) => query.queryKey[0] === 'projects' }, (data: any) => {
        const list = Array.isArray(data) ? data : [];
        return upsertById(list, project);
      });

      queryClient.setQueryData(['project', project._id], (data: any) => {
        return data ? { ...data, ...project } : project;
      });
    };

    const handleProjectDeleted = (payload: any) => {
      const projectId = payload?.projectId || payload?._id || payload;
      if (!projectId) return;

      queryClient.setQueriesData({ predicate: (query) => query.queryKey[0] === 'projects' }, (data: any) => {
        const list = Array.isArray(data) ? data : [];
        return removeById(list, projectId);
      });

      queryClient.removeQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectStats', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] });
    };

    const handleTaskUpsert = (payload: any) => {
      const task = payload?.task || payload;
      if (!task?._id) return;

      const projectId = task.projectId?._id || task.projectId;

      if (projectId) {
        queryClient.setQueriesData({ predicate: (query) => query.queryKey[0] === 'projectTasks' && query.queryKey[1] === projectId }, (data: any) => {
          const list = Array.isArray(data) ? data : [];
          return upsertById(list, task);
        });
        queryClient.invalidateQueries({ queryKey: ['projectStats', projectId] });
      }

      if (user?.id || (user as any)?._id) {
        const userId = (user as any)?._id || user?.id;
        const assigneeId = task.assigneeId?._id || task.assigneeId;
        if (assigneeId && userId && assigneeId.toString() === userId.toString()) {
          queryClient.setQueriesData({ predicate: (query) => query.queryKey[0] === 'myTasks' }, (data: any) => {
            const list = Array.isArray(data) ? data : [];
            return upsertById(list, task);
          });
        }
      }

      queryClient.setQueryData(['task', task._id], (data: any) => {
        return data ? { ...data, ...task } : task;
      });
    };

    const handleTaskDeleted = (payload: any) => {
      const taskId = payload?.taskId || payload?._id || payload;
      if (!taskId) return;

      queryClient.setQueriesData({ predicate: (query) => query.queryKey[0] === 'projectTasks' }, (data: any) => {
        const list = Array.isArray(data) ? data : [];
        return removeById(list, taskId);
      });

      queryClient.setQueriesData({ predicate: (query) => query.queryKey[0] === 'myTasks' }, (data: any) => {
        const list = Array.isArray(data) ? data : [];
        return removeById(list, taskId);
      });

      queryClient.removeQueries({ queryKey: ['task', taskId] });
      if (payload?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['projectStats', payload.projectId] });
      }
    };

    const handleCommentCreated = (payload: any) => {
      const comment = payload?.comment || payload;
      const taskId = payload?.taskId || comment?.taskId;
      if (!taskId || !comment?._id) return;

      queryClient.setQueriesData({ predicate: (query) => query.queryKey[0] === 'taskComments' && query.queryKey[1] === taskId }, (data: any) => {
        const list = Array.isArray(data) ? data : [];
        return [...list, comment];
      });
    };

    const handleCommentUpdated = (payload: any) => {
      const comment = payload?.comment || payload;
      const taskId = payload?.taskId || comment?.taskId;
      if (!taskId || !comment?._id) return;

      queryClient.setQueriesData({ predicate: (query) => query.queryKey[0] === 'taskComments' && query.queryKey[1] === taskId }, (data: any) => {
        const list = Array.isArray(data) ? data : [];
        return upsertById(list, comment);
      });
    };

    const handleCommentDeleted = (payload: any) => {
      const taskId = payload?.taskId;
      const commentId = payload?.commentId || payload?._id || payload;
      if (!taskId || !commentId) return;

      queryClient.setQueriesData({ predicate: (query) => query.queryKey[0] === 'taskComments' && query.queryKey[1] === taskId }, (data: any) => {
        const list = Array.isArray(data) ? data : [];
        return removeById(list, commentId);
      });
    };

    const handleStatsUpdate = (payload: any) => {
      if (!payload) return;
      queryClient.setQueryData(['userStats'], payload);
    };

    const handleNotificationsLoad = (payload: any) => {
      const notifications = Array.isArray(payload?.notifications) ? payload.notifications : [];
      queryClient.setQueryData(['notifications'], notifications);
    };

    const handleNotificationNew = (payload: any) => {
      const notification = payload?.notification || payload;
      if (!notification?._id) {
        return;
      }
      queryClient.setQueryData(['notifications'], (data: any) => {
        const list = Array.isArray(data) ? data : [];
        return upsertById(list, notification);
      });
    };

    const handleMemberUpsert = (payload: any) => {
      const member = payload?.member || payload;
      const organizationId = payload?.organizationId;
      if (!member?._id || !organizationId) {
        return;
      }

      queryClient.setQueriesData({ predicate: (query) => query.queryKey[0] === 'organizationMembers' && query.queryKey[1] === organizationId }, (data: any) => {
        const list = Array.isArray(data) ? data : [];
        return upsertById(list, member);
      });
    };

    const handleMemberRemove = (payload: any) => {
      const memberId = payload?.memberId || payload?._id;
      const organizationId = payload?.organizationId;
      if (!memberId || !organizationId) {
        return;
      }

      queryClient.setQueriesData({ predicate: (query) => query.queryKey[0] === 'organizationMembers' && query.queryKey[1] === organizationId }, (data: any) => {
        const list = Array.isArray(data) ? data : [];
        return removeById(list, memberId);
      });
    };

    socket.on('project:created', handleProjectUpsert);
    socket.on('project:updated', handleProjectUpsert);
    socket.on('project:archived', handleProjectUpsert);
    socket.on('project:unarchived', handleProjectUpsert);
    socket.on('project:deleted', handleProjectDeleted);

    socket.on('task:created', handleTaskUpsert);
    socket.on('task:updated', handleTaskUpsert);
    socket.on('task:deleted', handleTaskDeleted);

    socket.on('comment:created', handleCommentCreated);
    socket.on('comment:updated', handleCommentUpdated);
    socket.on('comment:deleted', handleCommentDeleted);

    socket.on('stats:update', handleStatsUpdate);
    socket.on('notifications:load', handleNotificationsLoad);
    socket.on('notification:new', handleNotificationNew);

    socket.on('member:invited', handleMemberUpsert);
    socket.on('member:role_updated', handleMemberUpsert);
    socket.on('member:removed', handleMemberRemove);
    socket.on('member:left', handleMemberRemove);

    return () => {
      socket.off('project:created', handleProjectUpsert);
      socket.off('project:updated', handleProjectUpsert);
      socket.off('project:archived', handleProjectUpsert);
      socket.off('project:unarchived', handleProjectUpsert);
      socket.off('project:deleted', handleProjectDeleted);

      socket.off('task:created', handleTaskUpsert);
      socket.off('task:updated', handleTaskUpsert);
      socket.off('task:deleted', handleTaskDeleted);

      socket.off('comment:created', handleCommentCreated);
      socket.off('comment:updated', handleCommentUpdated);
      socket.off('comment:deleted', handleCommentDeleted);

      socket.off('stats:update', handleStatsUpdate);
      socket.off('notifications:load', handleNotificationsLoad);
      socket.off('notification:new', handleNotificationNew);

      socket.off('member:invited', handleMemberUpsert);
      socket.off('member:role_updated', handleMemberUpsert);
      socket.off('member:removed', handleMemberRemove);
      socket.off('member:left', handleMemberRemove);
    };
  }, [socket, queryClient, user]);

  return null;
}
