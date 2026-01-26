/**
 * Default role permissions mapping
 */
export declare const DEFAULT_ROLE_PERMISSIONS: {
    owner: ("organization:read" | "organization:write" | "organization:delete" | "member:read" | "member:invite" | "member:remove" | "member:update_role" | "project:read" | "project:write" | "project:delete" | "project:assign" | "task:read" | "task:write" | "task:delete" | "task:assign")[];
    admin: ("organization:read" | "organization:write" | "member:read" | "member:invite" | "member:remove" | "member:update_role" | "project:read" | "project:write" | "project:delete" | "project:assign" | "task:read" | "task:write" | "task:delete" | "task:assign")[];
    manager: ("organization:read" | "member:read" | "project:read" | "project:write" | "project:assign" | "task:read" | "task:write" | "task:delete" | "task:assign")[];
    member: ("organization:read" | "member:read" | "project:read" | "task:read" | "task:write")[];
    guest: ("organization:read" | "member:read" | "project:read" | "task:read")[];
};
/**
 * Check if a role has a specific permission
 */
export declare const roleHasPermission: (rolePermissions: string[], requiredPermission: string) => boolean;
/**
 * Check if a role has any of the required permissions
 */
export declare const roleHasAnyPermission: (rolePermissions: string[], requiredPermissions: string[]) => boolean;
/**
 * Check if a role has all required permissions
 */
export declare const roleHasAllPermissions: (rolePermissions: string[], requiredPermissions: string[]) => boolean;
//# sourceMappingURL=definitions.d.ts.map