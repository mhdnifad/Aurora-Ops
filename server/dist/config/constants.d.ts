export declare const ROLES: {
    readonly OWNER: "owner";
    readonly ADMIN: "admin";
    readonly MANAGER: "manager";
    readonly MEMBER: "member";
    readonly GUEST: "guest";
};
export declare const PERMISSIONS: {
    readonly ORGANIZATION_READ: "organization:read";
    readonly ORGANIZATION_WRITE: "organization:write";
    readonly ORGANIZATION_DELETE: "organization:delete";
    readonly MEMBER_READ: "member:read";
    readonly MEMBER_INVITE: "member:invite";
    readonly MEMBER_REMOVE: "member:remove";
    readonly MEMBER_UPDATE_ROLE: "member:update_role";
    readonly PROJECT_READ: "project:read";
    readonly PROJECT_WRITE: "project:write";
    readonly PROJECT_DELETE: "project:delete";
    readonly PROJECT_ASSIGN: "project:assign";
    readonly TASK_READ: "task:read";
    readonly TASK_WRITE: "task:write";
    readonly TASK_DELETE: "task:delete";
    readonly TASK_ASSIGN: "task:assign";
};
export declare const TASK_STATUS: {
    readonly TODO: "todo";
    readonly IN_PROGRESS: "in_progress";
    readonly REVIEW: "review";
    readonly DONE: "done";
};
export declare const TASK_PRIORITY: {
    readonly LOW: "low";
    readonly MEDIUM: "medium";
    readonly HIGH: "high";
    readonly URGENT: "urgent";
};
export declare const PROJECT_STATUS: {
    readonly ACTIVE: "active";
    readonly ARCHIVED: "archived";
};
export declare const MEMBERSHIP_STATUS: {
    readonly ACTIVE: "active";
    readonly INVITED: "invited";
    readonly SUSPENDED: "suspended";
};
export declare const ORGANIZATION_PLAN: {
    readonly FREE: "free";
    readonly PRO: "pro";
    readonly ENTERPRISE: "enterprise";
};
export declare const ACTIVITY_TYPE: {
    readonly PROJECT_CREATED: "project_created";
    readonly PROJECT_UPDATED: "project_updated";
    readonly PROJECT_DELETED: "project_deleted";
    readonly TASK_CREATED: "task_created";
    readonly TASK_UPDATED: "task_updated";
    readonly TASK_DELETED: "task_deleted";
    readonly TASK_ASSIGNED: "task_assigned";
    readonly COMMENT_ADDED: "comment_added";
    readonly MEMBER_JOINED: "member_joined";
    readonly MEMBER_LEFT: "member_left";
};
export declare const NOTIFICATION_TYPE: {
    readonly TASK_ASSIGNED: "task_assigned";
    readonly TASK_UPDATED: "task_updated";
    readonly TASK_COMMENT: "task_comment";
    readonly PROJECT_INVITE: "project_invite";
    readonly ORGANIZATION_INVITE: "organization_invite";
    readonly MENTION: "mention";
    readonly SYSTEM: "system";
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export declare const SOCKET_EVENTS: {
    readonly CONNECTION: "connection";
    readonly DISCONNECT: "disconnect";
    readonly JOIN_ORGANIZATION: "join:organization";
    readonly LEAVE_ORGANIZATION: "leave:organization";
    readonly DASHBOARD_UPDATE: "dashboard:update";
    readonly TASK_CREATED: "task:created";
    readonly TASK_UPDATED: "task:updated";
    readonly TASK_DELETED: "task:deleted";
    readonly NOTIFICATION_NEW: "notification:new";
    readonly NOTIFICATION_READ: "notification:read";
    readonly ACTIVITY_NEW: "activity:new";
    readonly PRESENCE_ONLINE: "presence:online";
    readonly PRESENCE_OFFLINE: "presence:offline";
    readonly PRESENCE_UPDATE: "presence:update";
    readonly TYPING_START: "typing:start";
    readonly TYPING_STOP: "typing:stop";
    readonly PROJECT_UPDATED: "project:updated";
};
export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_LIMIT: 20;
    readonly MAX_LIMIT: 100;
};
export declare const RATE_LIMITS: {
    readonly AUTH: {
        readonly WINDOW_MS: number;
        readonly MAX: 100;
    };
    readonly API: {
        readonly WINDOW_MS: number;
        readonly MAX: 500;
    };
    readonly SOCKET: {
        readonly WINDOW_MS: number;
        readonly MAX: 100;
    };
};
//# sourceMappingURL=constants.d.ts.map