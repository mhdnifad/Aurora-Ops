import { Server, Socket } from 'socket.io';
import logger from '../utils/logger';
import Task from '../models/Task';
import Notification from '../models/Notification';
import Membership from '../models/Membership';
import JWTUtil from '../utils/jwt';
import User from '../models/User';

interface SocketUser {
  id: string;
  organizationId: string;
  email: string;
}

export class SocketManager {
  private io: Server;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private organizationSockets: Map<string, Set<string>> = new Map(); // orgId -> Set of socketIds

  constructor(io: Server) {
    this.io = io;
    this.setupMiddleware();
    this.setupHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const organizationId = socket.handshake.auth.organizationId;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        // Verify token (implement your JWT verification here)
        const user = await this.verifyToken(token, organizationId);
        if (!user) {
          return next(new Error('Authentication failed'));
        }

        (socket as any).user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  private setupHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const user = (socket as any).user as SocketUser;

      if (!user.organizationId) {
        socket.disconnect();
        return;
      }

      logger.info(`User connected: ${user.id} - ${socket.id}`);

      // Track user connection
      if (!this.userSockets.has(user.id)) {
        this.userSockets.set(user.id, new Set());
      }
      this.userSockets.get(user.id)?.add(socket.id);

      if (!this.organizationSockets.has(user.organizationId)) {
        this.organizationSockets.set(user.organizationId, new Set());
      }
      this.organizationSockets.get(user.organizationId)?.add(socket.id);

      // Join organization room
      socket.join(`org:${user.organizationId}`);

      // Broadcast user online status
      this.broadcastUserPresence(user, 'online');

      // Handle events
      socket.on('join-project', (projectId) => this.handleJoinProject(socket, user, projectId));
      socket.on('leave-project', (projectId) => this.handleLeaveProject(socket, user, projectId));

      socket.on('task:create', (data) => this.handleTaskCreate(socket, user, data));
      socket.on('task:update', (data) => this.handleTaskUpdate(socket, user, data));
      socket.on('task:delete', (data) => this.handleTaskDelete(socket, user, data));
      socket.on('task:comment', (data) => this.handleTaskComment(socket, user, data));

      socket.on('notification:read', (data) => this.handleNotificationRead(socket, user, data));

      socket.on('typing', (data) => this.handleTyping(socket, user, data));
      socket.on('stop-typing', (data) => this.handleStopTyping(socket, user, data));

      // Real-time subscriptions
      socket.on('stats:subscribe', () => this.handleStatsSubscribe(socket, user));
      socket.on('stats:unsubscribe', () => this.handleStatsUnsubscribe(socket, user));
      socket.on('tasks:subscribe', () => this.handleTasksSubscribe(socket, user));
      socket.on('tasks:unsubscribe', () => this.handleTasksUnsubscribe(socket, user));

      socket.on('disconnect', () => this.handleDisconnect(socket, user));

      // Send initial notifications
      this.sendUserNotifications(user);
    });
  }

  private async handleJoinProject(socket: Socket, user: SocketUser, projectId: string) {
    try {
      socket.join(`project:${projectId}`);
      this.io.to(`project:${projectId}`).emit('user:joined', {
        userId: user.id,
        projectId,
        timestamp: new Date(),
      });
      logger.info(`User ${user.id} joined project ${projectId}`);
    } catch (error) {
      logger.error('Error joining project:', error);
    }
  }

  private async handleLeaveProject(socket: Socket, user: SocketUser, projectId: string) {
    try {
      socket.leave(`project:${projectId}`);
      this.io.to(`project:${projectId}`).emit('user:left', {
        userId: user.id,
        projectId,
        timestamp: new Date(),
      });
      logger.info(`User ${user.id} left project ${projectId}`);
    } catch (error) {
      logger.error('Error leaving project:', error);
    }
  }

  private async handleTaskCreate(socket: Socket, user: SocketUser, data: any) {
    try {
      const { projectId, taskData } = data;

      // Create task (should go through controller in production)
      const task = await Task.create({
        ...taskData,
        organizationId: user.organizationId,
        projectId,
        createdBy: user.id,
      });

      // Broadcast to project
      this.io.to(`project:${projectId}`).emit('task:created', {
        task,
        createdBy: user.id,
        timestamp: new Date(),
      });

      // Notify organization
      this.broadcastNotification(user.organizationId, {
        type: 'task_created',
        title: 'New Task Created',
        message: `${taskData.title} was created`,
        taskId: task._id,
      });

      logger.info(`Task created by ${user.id}: ${task._id}`);
    } catch (error) {
      logger.error('Error creating task:', error);
      socket.emit('error', { message: 'Failed to create task' });
    }
  }

  private async handleTaskUpdate(socket: Socket, user: SocketUser, data: any) {
    try {
      const { taskId, projectId, updates } = data;

      const task = await Task.findByIdAndUpdate(taskId, updates, { new: true });
      if (!task) {
        throw new Error('Task not found');
      }

      this.io.to(`project:${projectId}`).emit('task:updated', {
        taskId,
        updates,
        updatedBy: user.id,
        timestamp: new Date(),
      });

      logger.info(`Task updated by ${user.id}: ${taskId}`);
    } catch (error) {
      logger.error('Error updating task:', error);
      socket.emit('error', { message: 'Failed to update task' });
    }
  }

  private async handleTaskDelete(socket: Socket, user: SocketUser, data: any) {
    try {
      const { taskId, projectId } = data;

      await Task.findByIdAndDelete(taskId);

      this.io.to(`project:${projectId}`).emit('task:deleted', {
        taskId,
        deletedBy: user.id,
        timestamp: new Date(),
      });

      logger.info(`Task deleted by ${user.id}: ${taskId}`);
    } catch (error) {
      logger.error('Error deleting task:', error);
      socket.emit('error', { message: 'Failed to delete task' });
    }
  }

  private async handleTaskComment(socket: Socket, user: SocketUser, data: any) {
    try {
      const { taskId, projectId, comment } = data;

      // In production, save comment to database
      this.io.to(`project:${projectId}`).emit('task:comment-added', {
        taskId,
        comment: {
          text: comment,
          author: user.id,
          createdAt: new Date(),
        },
        timestamp: new Date(),
      });

      logger.info(`Comment added to task ${taskId} by ${user.id}`);
    } catch (error) {
      logger.error('Error adding comment:', error);
      socket.emit('error', { message: 'Failed to add comment' });
    }
  }

  private async handleNotificationRead(socket: Socket, _user: SocketUser, data: any) {
    try {
      const { notificationId } = data;

      await Notification.findByIdAndUpdate(notificationId, { read: true });

      socket.emit('notification:marked-read', { notificationId });
      logger.info(`Notification marked as read: ${notificationId}`);
    } catch (error) {
      logger.error('Error marking notification as read:', error);
    }
  }

  private async handleTyping(_socket: Socket, user: SocketUser, data: any) {
    try {
      const { taskId, projectId } = data;

      this.io.to(`project:${projectId}`).emit('user:typing', {
        userId: user.id,
        taskId,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error handling typing:', error);
    }
  }

  private async handleStopTyping(_socket: Socket, user: SocketUser, data: any) {
    try {
      const { taskId, projectId } = data;

      this.io.to(`project:${projectId}`).emit('user:stop-typing', {
        userId: user.id,
        taskId,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error handling stop typing:', error);
    }
  }

  private async handleDisconnect(socket: Socket, user: SocketUser) {
    try {
      // Remove from tracking
      this.userSockets.get(user.id)?.delete(socket.id);
      if (this.userSockets.get(user.id)?.size === 0) {
        this.userSockets.delete(user.id);
        this.broadcastUserPresence(user, 'offline');
      }

      this.organizationSockets.get(user.organizationId)?.delete(socket.id);

      logger.info(`User disconnected: ${user.id} - ${socket.id}`);
    } catch (error) {
      logger.error('Error handling disconnect:', error);
    }
  }

  private async sendUserNotifications(user: SocketUser) {
    try {
      const notifications = await Notification.find({
        organizationId: user.organizationId,
        userId: user.id,
        read: false,
      })
        .limit(10)
        .sort({ createdAt: -1 })
        .lean();

      this.io.to(Array.from(this.userSockets.get(user.id) || [])).emit('notifications:load', {
        notifications,
      });
    } catch (error) {
      logger.error('Error sending notifications:', error);
    }
  }

  private broadcastUserPresence(user: SocketUser, status: 'online' | 'offline') {
    this.io.to(`org:${user.organizationId}`).emit('user:presence', {
      userId: user.id,
      status,
      timestamp: new Date(),
    });
  }

  private broadcastNotification(organizationId: string, notification: any) {
    this.io.to(`org:${organizationId}`).emit('notification:new', notification);
  }

  private async verifyToken(token: string, organizationId?: string): Promise<SocketUser | null> {
    try {
      const decoded = JWTUtil.verifyAccessToken(token);
      if (!decoded || !decoded.userId) {
        return null;
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        return null;
      }

      // Resolve organization via membership to prevent spoofing
      const membership = await Membership.findOne(
        organizationId
          ? { userId: user._id, organizationId }
          : { userId: user._id }
      );

      if (!membership) {
        return null;
      }

      return {
        id: user._id.toString(),
        organizationId: membership.organizationId.toString(),
        email: user.email,
      };
    } catch (error) {
      logger.error('Socket token verification failed:', error);
      return null;
    }
  }

  // Real-time stats subscription handlers
  private async handleStatsSubscribe(socket: Socket, user: SocketUser) {
    try {
      socket.join(`stats:${user.id}`);
      
      // Send initial stats
      const tasks = await Task.find({
        assignedTo: user.id,
        organizationId: user.organizationId,
      });

      const stats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === 'done').length,
        inProgressTasks: tasks.filter((t) => t.status === 'in_progress').length,
        todoTasks: tasks.filter((t) => t.status === 'todo').length,
      };

      socket.emit('stats:update', stats);
      logger.info(`User ${user.id} subscribed to stats`);
    } catch (error) {
      logger.error('Error subscribing to stats:', error);
    }
  }

  private handleStatsUnsubscribe(socket: Socket, user: SocketUser) {
    socket.leave(`stats:${user.id}`);
    logger.info(`User ${user.id} unsubscribed from stats`);
  }

  // Real-time tasks subscription handlers
  private async handleTasksSubscribe(socket: Socket, user: SocketUser) {
    try {
      socket.join(`user-tasks:${user.id}`);
      
      // Send initial tasks
      const tasks = await Task.find({
        assignedTo: user.id,
        organizationId: user.organizationId,
      })
        .populate('projectId', 'name')
        .populate('assignedTo', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(20);

      socket.emit('tasks:loaded', tasks);
      logger.info(`User ${user.id} subscribed to tasks`);
    } catch (error) {
      logger.error('Error subscribing to tasks:', error);
    }
  }

  private handleTasksUnsubscribe(socket: Socket, user: SocketUser) {
    socket.leave(`user-tasks:${user.id}`);
    logger.info(`User ${user.id} unsubscribed from tasks`);
  }

  // Broadcast task updates to subscribed users
  public broadcastTaskUpdate(task: any, event: 'created' | 'updated' | 'deleted') {
    if (task.assignedTo) {
      this.io.to(`user-tasks:${task.assignedTo}`).emit(`task:${event}`, task);
      
      // Also update stats for the user
      this.updateUserStats(task.assignedTo.toString());
    }
  }

  // Update and broadcast user stats
  private async updateUserStats(userId: string) {
    try {
      const tasks = await Task.find({ assignedTo: userId });
      const stats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === 'done').length,
        inProgressTasks: tasks.filter((t) => t.status === 'in_progress').length,
        todoTasks: tasks.filter((t) => t.status === 'todo').length,
      };

      this.io.to(`stats:${userId}`).emit('stats:update', stats);
    } catch (error) {
      logger.error('Error updating user stats:', error);
    }
  }
}

export default SocketManager;
