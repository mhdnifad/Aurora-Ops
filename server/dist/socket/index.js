"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketManager = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const Task_1 = __importDefault(require("../models/Task"));
const Notification_1 = __importDefault(require("../models/Notification"));
const Membership_1 = __importDefault(require("../models/Membership"));
const jwt_1 = __importDefault(require("../utils/jwt"));
const User_1 = __importDefault(require("../models/User"));
class SocketManager {
    io;
    userSockets = new Map(); // userId -> Set of socketIds
    organizationSockets = new Map(); // orgId -> Set of socketIds
    constructor(io) {
        this.io = io;
        this.setupMiddleware();
        this.setupHandlers();
    }
    setupMiddleware() {
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
                socket.user = user;
                next();
            }
            catch (error) {
                next(new Error('Authentication error'));
            }
        });
    }
    setupHandlers() {
        this.io.on('connection', (socket) => {
            const user = socket.user;
            if (!user.organizationId) {
                socket.disconnect();
                return;
            }
            logger_1.default.info(`User connected: ${user.id} - ${socket.id}`);
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
    async handleJoinProject(socket, user, projectId) {
        try {
            socket.join(`project:${projectId}`);
            this.io.to(`project:${projectId}`).emit('user:joined', {
                userId: user.id,
                projectId,
                timestamp: new Date(),
            });
            logger_1.default.info(`User ${user.id} joined project ${projectId}`);
        }
        catch (error) {
            logger_1.default.error('Error joining project:', error);
        }
    }
    async handleLeaveProject(socket, user, projectId) {
        try {
            socket.leave(`project:${projectId}`);
            this.io.to(`project:${projectId}`).emit('user:left', {
                userId: user.id,
                projectId,
                timestamp: new Date(),
            });
            logger_1.default.info(`User ${user.id} left project ${projectId}`);
        }
        catch (error) {
            logger_1.default.error('Error leaving project:', error);
        }
    }
    async handleTaskCreate(socket, user, data) {
        try {
            const { projectId, taskData } = data;
            // Create task (should go through controller in production)
            const task = await Task_1.default.create({
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
            logger_1.default.info(`Task created by ${user.id}: ${task._id}`);
        }
        catch (error) {
            logger_1.default.error('Error creating task:', error);
            socket.emit('error', { message: 'Failed to create task' });
        }
    }
    async handleTaskUpdate(socket, user, data) {
        try {
            const { taskId, projectId, updates } = data;
            const task = await Task_1.default.findByIdAndUpdate(taskId, updates, { new: true });
            if (!task) {
                throw new Error('Task not found');
            }
            this.io.to(`project:${projectId}`).emit('task:updated', {
                taskId,
                updates,
                updatedBy: user.id,
                timestamp: new Date(),
            });
            logger_1.default.info(`Task updated by ${user.id}: ${taskId}`);
        }
        catch (error) {
            logger_1.default.error('Error updating task:', error);
            socket.emit('error', { message: 'Failed to update task' });
        }
    }
    async handleTaskDelete(socket, user, data) {
        try {
            const { taskId, projectId } = data;
            await Task_1.default.findByIdAndDelete(taskId);
            this.io.to(`project:${projectId}`).emit('task:deleted', {
                taskId,
                deletedBy: user.id,
                timestamp: new Date(),
            });
            logger_1.default.info(`Task deleted by ${user.id}: ${taskId}`);
        }
        catch (error) {
            logger_1.default.error('Error deleting task:', error);
            socket.emit('error', { message: 'Failed to delete task' });
        }
    }
    async handleTaskComment(socket, user, data) {
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
            logger_1.default.info(`Comment added to task ${taskId} by ${user.id}`);
        }
        catch (error) {
            logger_1.default.error('Error adding comment:', error);
            socket.emit('error', { message: 'Failed to add comment' });
        }
    }
    async handleNotificationRead(socket, _user, data) {
        try {
            const { notificationId } = data;
            await Notification_1.default.findByIdAndUpdate(notificationId, { read: true });
            socket.emit('notification:marked-read', { notificationId });
            logger_1.default.info(`Notification marked as read: ${notificationId}`);
        }
        catch (error) {
            logger_1.default.error('Error marking notification as read:', error);
        }
    }
    async handleTyping(_socket, user, data) {
        try {
            const { taskId, projectId } = data;
            this.io.to(`project:${projectId}`).emit('user:typing', {
                userId: user.id,
                taskId,
                timestamp: new Date(),
            });
        }
        catch (error) {
            logger_1.default.error('Error handling typing:', error);
        }
    }
    async handleStopTyping(_socket, user, data) {
        try {
            const { taskId, projectId } = data;
            this.io.to(`project:${projectId}`).emit('user:stop-typing', {
                userId: user.id,
                taskId,
                timestamp: new Date(),
            });
        }
        catch (error) {
            logger_1.default.error('Error handling stop typing:', error);
        }
    }
    async handleDisconnect(socket, user) {
        try {
            // Remove from tracking
            this.userSockets.get(user.id)?.delete(socket.id);
            if (this.userSockets.get(user.id)?.size === 0) {
                this.userSockets.delete(user.id);
                this.broadcastUserPresence(user, 'offline');
            }
            this.organizationSockets.get(user.organizationId)?.delete(socket.id);
            logger_1.default.info(`User disconnected: ${user.id} - ${socket.id}`);
        }
        catch (error) {
            logger_1.default.error('Error handling disconnect:', error);
        }
    }
    async sendUserNotifications(user) {
        try {
            const notifications = await Notification_1.default.find({
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
        }
        catch (error) {
            logger_1.default.error('Error sending notifications:', error);
        }
    }
    broadcastUserPresence(user, status) {
        this.io.to(`org:${user.organizationId}`).emit('user:presence', {
            userId: user.id,
            status,
            timestamp: new Date(),
        });
    }
    broadcastNotification(organizationId, notification) {
        this.io.to(`org:${organizationId}`).emit('notification:new', notification);
    }
    async verifyToken(token, organizationId) {
        try {
            const decoded = jwt_1.default.verifyAccessToken(token);
            if (!decoded || !decoded.userId) {
                return null;
            }
            const user = await User_1.default.findById(decoded.userId);
            if (!user) {
                return null;
            }
            // Resolve organization via membership to prevent spoofing
            const membership = await Membership_1.default.findOne(organizationId
                ? { userId: user._id, organizationId }
                : { userId: user._id });
            if (!membership) {
                return null;
            }
            return {
                id: user._id.toString(),
                organizationId: membership.organizationId.toString(),
                email: user.email,
            };
        }
        catch (error) {
            logger_1.default.error('Socket token verification failed:', error);
            return null;
        }
    }
    // Real-time stats subscription handlers
    async handleStatsSubscribe(socket, user) {
        try {
            socket.join(`stats:${user.id}`);
            // Send initial stats
            const tasks = await Task_1.default.find({
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
            logger_1.default.info(`User ${user.id} subscribed to stats`);
        }
        catch (error) {
            logger_1.default.error('Error subscribing to stats:', error);
        }
    }
    handleStatsUnsubscribe(socket, user) {
        socket.leave(`stats:${user.id}`);
        logger_1.default.info(`User ${user.id} unsubscribed from stats`);
    }
    // Real-time tasks subscription handlers
    async handleTasksSubscribe(socket, user) {
        try {
            socket.join(`user-tasks:${user.id}`);
            // Send initial tasks
            const tasks = await Task_1.default.find({
                assignedTo: user.id,
                organizationId: user.organizationId,
            })
                .populate('projectId', 'name')
                .populate('assignedTo', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .limit(20);
            socket.emit('tasks:loaded', tasks);
            logger_1.default.info(`User ${user.id} subscribed to tasks`);
        }
        catch (error) {
            logger_1.default.error('Error subscribing to tasks:', error);
        }
    }
    handleTasksUnsubscribe(socket, user) {
        socket.leave(`user-tasks:${user.id}`);
        logger_1.default.info(`User ${user.id} unsubscribed from tasks`);
    }
    // Broadcast task updates to subscribed users
    broadcastTaskUpdate(task, event) {
        if (task.assignedTo) {
            this.io.to(`user-tasks:${task.assignedTo}`).emit(`task:${event}`, task);
            // Also update stats for the user
            this.updateUserStats(task.assignedTo.toString());
        }
    }
    // Update and broadcast user stats
    async updateUserStats(userId) {
        try {
            const tasks = await Task_1.default.find({ assignedTo: userId });
            const stats = {
                totalTasks: tasks.length,
                completedTasks: tasks.filter((t) => t.status === 'done').length,
                inProgressTasks: tasks.filter((t) => t.status === 'in_progress').length,
                todoTasks: tasks.filter((t) => t.status === 'todo').length,
            };
            this.io.to(`stats:${userId}`).emit('stats:update', stats);
        }
        catch (error) {
            logger_1.default.error('Error updating user stats:', error);
        }
    }
}
exports.SocketManager = SocketManager;
exports.default = SocketManager;
//# sourceMappingURL=index.js.map