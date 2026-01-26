"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMITS = exports.PAGINATION = exports.SOCKET_EVENTS = exports.HTTP_STATUS = exports.NOTIFICATION_TYPE = exports.ACTIVITY_TYPE = exports.ORGANIZATION_PLAN = exports.MEMBERSHIP_STATUS = exports.PROJECT_STATUS = exports.TASK_PRIORITY = exports.TASK_STATUS = exports.PERMISSIONS = exports.ROLES = void 0;
exports.ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    MANAGER: 'manager',
    MEMBER: 'member',
    GUEST: 'guest',
};
exports.PERMISSIONS = {
    // Organization permissions
    ORGANIZATION_READ: 'organization:read',
    ORGANIZATION_WRITE: 'organization:write',
    ORGANIZATION_DELETE: 'organization:delete',
    // Member permissions
    MEMBER_READ: 'member:read',
    MEMBER_INVITE: 'member:invite',
    MEMBER_REMOVE: 'member:remove',
    MEMBER_UPDATE_ROLE: 'member:update_role',
    // Project permissions
    PROJECT_READ: 'project:read',
    PROJECT_WRITE: 'project:write',
    PROJECT_DELETE: 'project:delete',
    PROJECT_ASSIGN: 'project:assign',
    // Task permissions
    TASK_READ: 'task:read',
    TASK_WRITE: 'task:write',
    TASK_DELETE: 'task:delete',
    TASK_ASSIGN: 'task:assign',
};
exports.TASK_STATUS = {
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    REVIEW: 'review',
    DONE: 'done',
};
exports.TASK_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
};
exports.PROJECT_STATUS = {
    ACTIVE: 'active',
    ARCHIVED: 'archived',
};
exports.MEMBERSHIP_STATUS = {
    ACTIVE: 'active',
    INVITED: 'invited',
    SUSPENDED: 'suspended',
};
exports.ORGANIZATION_PLAN = {
    FREE: 'free',
    PRO: 'pro',
    ENTERPRISE: 'enterprise',
};
exports.ACTIVITY_TYPE = {
    PROJECT_CREATED: 'project_created',
    PROJECT_UPDATED: 'project_updated',
    PROJECT_DELETED: 'project_deleted',
    TASK_CREATED: 'task_created',
    TASK_UPDATED: 'task_updated',
    TASK_DELETED: 'task_deleted',
    TASK_ASSIGNED: 'task_assigned',
    COMMENT_ADDED: 'comment_added',
    MEMBER_JOINED: 'member_joined',
    MEMBER_LEFT: 'member_left',
};
exports.NOTIFICATION_TYPE = {
    TASK_ASSIGNED: 'task_assigned',
    TASK_UPDATED: 'task_updated',
    TASK_COMMENT: 'task_comment',
    PROJECT_INVITE: 'project_invite',
    ORGANIZATION_INVITE: 'organization_invite',
    MENTION: 'mention',
    SYSTEM: 'system',
};
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
};
exports.SOCKET_EVENTS = {
    // Connection
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    // Organization
    JOIN_ORGANIZATION: 'join:organization',
    LEAVE_ORGANIZATION: 'leave:organization',
    // Dashboard
    DASHBOARD_UPDATE: 'dashboard:update',
    // Tasks
    TASK_CREATED: 'task:created',
    TASK_UPDATED: 'task:updated',
    TASK_DELETED: 'task:deleted',
    // Notifications
    NOTIFICATION_NEW: 'notification:new',
    NOTIFICATION_READ: 'notification:read',
    // Activity
    ACTIVITY_NEW: 'activity:new',
    // Presence
    PRESENCE_ONLINE: 'presence:online',
    PRESENCE_OFFLINE: 'presence:offline',
    PRESENCE_UPDATE: 'presence:update',
    // Typing
    TYPING_START: 'typing:start',
    TYPING_STOP: 'typing:stop',
    // Projects
    PROJECT_UPDATED: 'project:updated',
};
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
};
exports.RATE_LIMITS = {
    AUTH: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX: 100, // 100 requests per window for development
    },
    API: {
        WINDOW_MS: 15 * 60 * 1000,
        MAX: 500, // 500 requests for development
    },
    SOCKET: {
        WINDOW_MS: 60 * 1000,
        MAX: 100,
    },
};
//# sourceMappingURL=constants.js.map