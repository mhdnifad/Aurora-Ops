import { PERMISSIONS, ROLES } from '../config/constants';

/**
 * Default role permissions mapping
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  [ROLES.OWNER]: [
    // Organization
    PERMISSIONS.ORGANIZATION_READ,
    PERMISSIONS.ORGANIZATION_WRITE,
    PERMISSIONS.ORGANIZATION_DELETE,
    
    // Members
    PERMISSIONS.MEMBER_READ,
    PERMISSIONS.MEMBER_INVITE,
    PERMISSIONS.MEMBER_REMOVE,
    PERMISSIONS.MEMBER_UPDATE_ROLE,
    
    // Projects
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_WRITE,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.PROJECT_ASSIGN,
    
    // Tasks
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_WRITE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.TASK_ASSIGN,
  ],

  [ROLES.ADMIN]: [
    // Organization
    PERMISSIONS.ORGANIZATION_READ,
    PERMISSIONS.ORGANIZATION_WRITE,
    
    // Members
    PERMISSIONS.MEMBER_READ,
    PERMISSIONS.MEMBER_INVITE,
    PERMISSIONS.MEMBER_REMOVE,
    PERMISSIONS.MEMBER_UPDATE_ROLE,
    
    // Projects
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_WRITE,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.PROJECT_ASSIGN,
    
    // Tasks
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_WRITE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.TASK_ASSIGN,
  ],

  [ROLES.MANAGER]: [
    // Organization
    PERMISSIONS.ORGANIZATION_READ,
    
    // Members
    PERMISSIONS.MEMBER_READ,
    
    // Projects
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_WRITE,
    PERMISSIONS.PROJECT_ASSIGN,
    
    // Tasks
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_WRITE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.TASK_ASSIGN,
  ],

  [ROLES.MEMBER]: [
    // Organization
    PERMISSIONS.ORGANIZATION_READ,
    
    // Members
    PERMISSIONS.MEMBER_READ,
    
    // Projects
    PERMISSIONS.PROJECT_READ,
    
    // Tasks
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_WRITE,
  ],

  [ROLES.GUEST]: [
    // Organization
    PERMISSIONS.ORGANIZATION_READ,
    
    // Members
    PERMISSIONS.MEMBER_READ,
    
    // Projects
    PERMISSIONS.PROJECT_READ,
    
    // Tasks
    PERMISSIONS.TASK_READ,
  ],
};

/**
 * Check if a role has a specific permission
 */
export const roleHasPermission = (
  rolePermissions: string[],
  requiredPermission: string
): boolean => {
  return rolePermissions.includes(requiredPermission);
};

/**
 * Check if a role has any of the required permissions
 */
export const roleHasAnyPermission = (
  rolePermissions: string[],
  requiredPermissions: string[]
): boolean => {
  return requiredPermissions.some((permission) =>
    rolePermissions.includes(permission)
  );
};

/**
 * Check if a role has all required permissions
 */
export const roleHasAllPermissions = (
  rolePermissions: string[],
  requiredPermissions: string[]
): boolean => {
  return requiredPermissions.every((permission) =>
    rolePermissions.includes(permission)
  );
};
