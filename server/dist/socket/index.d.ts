import { Server } from 'socket.io';
export declare class SocketManager {
    private io;
    private userSockets;
    private organizationSockets;
    constructor(io: Server);
    private setupMiddleware;
    private setupHandlers;
    private handleJoinProject;
    private handleLeaveProject;
    private handleTaskCreate;
    private handleTaskUpdate;
    private handleTaskDelete;
    private handleTaskComment;
    private handleNotificationRead;
    private handleTyping;
    private handleStopTyping;
    private handleDisconnect;
    private sendUserNotifications;
    private broadcastUserPresence;
    private broadcastNotification;
    private verifyToken;
    private handleStatsSubscribe;
    private handleStatsUnsubscribe;
    private handleTasksSubscribe;
    private handleTasksUnsubscribe;
    broadcastTaskUpdate(task: any, event: 'created' | 'updated' | 'deleted'): void;
    private updateUserStats;
}
export default SocketManager;
//# sourceMappingURL=index.d.ts.map