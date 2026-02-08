export const SYSTEM_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const ORG_ROLES = {
  COMPANY_ADMIN: 'company_admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  CLIENT: 'client',
} as const;

export const LEGACY_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
  GUEST: 'guest',
} as const;

// Combined for backwards compatibility with existing imports
export const ROLES = {
  ...ORG_ROLES,
  ...LEGACY_ROLES,
} as const;

export const PERMISSIONS = {
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
} as const;

// Map legacy or route-level permission strings to canonical permissions
export const PERMISSION_ALIASES: Record<string, string[]> = {
  create_project: [PERMISSIONS.PROJECT_WRITE],
  update_project: [PERMISSIONS.PROJECT_WRITE],
  delete_project: [PERMISSIONS.PROJECT_DELETE],
  create_task: [PERMISSIONS.TASK_WRITE],
  update_task: [PERMISSIONS.TASK_WRITE],
  delete_task: [PERMISSIONS.TASK_DELETE],
  manage_members: [
    PERMISSIONS.MEMBER_INVITE,
    PERMISSIONS.MEMBER_REMOVE,
    PERMISSIONS.MEMBER_UPDATE_ROLE,
  ],
  update_organization: [PERMISSIONS.ORGANIZATION_WRITE],
};

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
} as const;

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;

export const MEMBERSHIP_STATUS = {
  ACTIVE: 'active',
  INVITED: 'invited',
  SUSPENDED: 'suspended',
} as const;

export const ORGANIZATION_PLAN = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

export const ACTIVITY_TYPE = {
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
} as const;

export const NOTIFICATION_TYPE = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_UPDATED: 'task_updated',
  TASK_COMMENT: 'task_comment',
  PROJECT_INVITE: 'project_invite',
  ORGANIZATION_INVITE: 'organization_invite',
  MENTION: 'mention',
  SYSTEM: 'system',
} as const;

export const HTTP_STATUS = {
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
} as const;

export const SOCKET_EVENTS = {
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
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const RATE_LIMITS = {
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
} as const;
