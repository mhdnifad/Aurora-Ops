"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleHasAllPermissions = exports.roleHasAnyPermission = exports.roleHasPermission = exports.DEFAULT_ROLE_PERMISSIONS = void 0;
const constants_1 = require("../config/constants");
/**
 * Default role permissions mapping
 */
exports.DEFAULT_ROLE_PERMISSIONS = {
    [constants_1.ROLES.OWNER]: [
        // Organization
        constants_1.PERMISSIONS.ORGANIZATION_READ,
        constants_1.PERMISSIONS.ORGANIZATION_WRITE,
        constants_1.PERMISSIONS.ORGANIZATION_DELETE,
        // Members
        constants_1.PERMISSIONS.MEMBER_READ,
        constants_1.PERMISSIONS.MEMBER_INVITE,
        constants_1.PERMISSIONS.MEMBER_REMOVE,
        constants_1.PERMISSIONS.MEMBER_UPDATE_ROLE,
        // Projects
        constants_1.PERMISSIONS.PROJECT_READ,
        constants_1.PERMISSIONS.PROJECT_WRITE,
        constants_1.PERMISSIONS.PROJECT_DELETE,
        constants_1.PERMISSIONS.PROJECT_ASSIGN,
        // Tasks
        constants_1.PERMISSIONS.TASK_READ,
        constants_1.PERMISSIONS.TASK_WRITE,
        constants_1.PERMISSIONS.TASK_DELETE,
        constants_1.PERMISSIONS.TASK_ASSIGN,
    ],
    [constants_1.ROLES.ADMIN]: [
        // Organization
        constants_1.PERMISSIONS.ORGANIZATION_READ,
        constants_1.PERMISSIONS.ORGANIZATION_WRITE,
        // Members
        constants_1.PERMISSIONS.MEMBER_READ,
        constants_1.PERMISSIONS.MEMBER_INVITE,
        constants_1.PERMISSIONS.MEMBER_REMOVE,
        constants_1.PERMISSIONS.MEMBER_UPDATE_ROLE,
        // Projects
        constants_1.PERMISSIONS.PROJECT_READ,
        constants_1.PERMISSIONS.PROJECT_WRITE,
        constants_1.PERMISSIONS.PROJECT_DELETE,
        constants_1.PERMISSIONS.PROJECT_ASSIGN,
        // Tasks
        constants_1.PERMISSIONS.TASK_READ,
        constants_1.PERMISSIONS.TASK_WRITE,
        constants_1.PERMISSIONS.TASK_DELETE,
        constants_1.PERMISSIONS.TASK_ASSIGN,
    ],
    [constants_1.ROLES.MANAGER]: [
        // Organization
        constants_1.PERMISSIONS.ORGANIZATION_READ,
        // Members
        constants_1.PERMISSIONS.MEMBER_READ,
        // Projects
        constants_1.PERMISSIONS.PROJECT_READ,
        constants_1.PERMISSIONS.PROJECT_WRITE,
        constants_1.PERMISSIONS.PROJECT_ASSIGN,
        // Tasks
        constants_1.PERMISSIONS.TASK_READ,
        constants_1.PERMISSIONS.TASK_WRITE,
        constants_1.PERMISSIONS.TASK_DELETE,
        constants_1.PERMISSIONS.TASK_ASSIGN,
    ],
    [constants_1.ROLES.MEMBER]: [
        // Organization
        constants_1.PERMISSIONS.ORGANIZATION_READ,
        // Members
        constants_1.PERMISSIONS.MEMBER_READ,
        // Projects
        constants_1.PERMISSIONS.PROJECT_READ,
        // Tasks
        constants_1.PERMISSIONS.TASK_READ,
        constants_1.PERMISSIONS.TASK_WRITE,
    ],
    [constants_1.ROLES.GUEST]: [
        // Organization
        constants_1.PERMISSIONS.ORGANIZATION_READ,
        // Members
        constants_1.PERMISSIONS.MEMBER_READ,
        // Projects
        constants_1.PERMISSIONS.PROJECT_READ,
        // Tasks
        constants_1.PERMISSIONS.TASK_READ,
    ],
};
/**
 * Check if a role has a specific permission
 */
const roleHasPermission = (rolePermissions, requiredPermission) => {
    return rolePermissions.includes(requiredPermission);
};
exports.roleHasPermission = roleHasPermission;
/**
 * Check if a role has any of the required permissions
 */
const roleHasAnyPermission = (rolePermissions, requiredPermissions) => {
    return requiredPermissions.some((permission) => rolePermissions.includes(permission));
};
exports.roleHasAnyPermission = roleHasAnyPermission;
/**
 * Check if a role has all required permissions
 */
const roleHasAllPermissions = (rolePermissions, requiredPermissions) => {
    return requiredPermissions.every((permission) => rolePermissions.includes(permission));
};
exports.roleHasAllPermissions = roleHasAllPermissions;
//# sourceMappingURL=definitions.js.map