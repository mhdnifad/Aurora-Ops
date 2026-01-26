"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionChecker = void 0;
const tenant_middleware_1 = require("../middlewares/tenant.middleware");
class PermissionChecker {
    /**
     * Check if user has permission in organization
     */
    static async userHasPermission(userId, organizationId, _permission) {
        try {
            const membership = await (0, tenant_middleware_1.getUserMembership)(userId, organizationId);
            if (!membership) {
                return false;
            }
            return ['admin', 'owner'].includes(membership.role);
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Check if user has any of the permissions
     */
    static async userHasAnyPermission(userId, organizationId, _permissions) {
        try {
            const membership = await (0, tenant_middleware_1.getUserMembership)(userId, organizationId);
            if (!membership) {
                return false;
            }
            return ['admin', 'owner'].includes(membership.role);
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Check if user has all permissions
     */
    static async userHasAllPermissions(userId, organizationId, _permissions) {
        try {
            const membership = await (0, tenant_middleware_1.getUserMembership)(userId, organizationId);
            if (!membership) {
                return false;
            }
            return ['admin', 'owner'].includes(membership.role);
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Check if user has role
     */
    static async userHasRole(userId, organizationId, roleName) {
        try {
            const membership = await (0, tenant_middleware_1.getUserMembership)(userId, organizationId);
            if (!membership) {
                return false;
            }
            return membership.role === roleName;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Check if user has any of the roles
     */
    static async userHasAnyRole(userId, organizationId, roleNames) {
        try {
            const membership = await (0, tenant_middleware_1.getUserMembership)(userId, organizationId);
            if (!membership) {
                return false;
            }
            return roleNames.includes(membership.role);
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get user's permissions in organization
     */
    static async getUserPermissions(userId, organizationId) {
        try {
            const membership = await (0, tenant_middleware_1.getUserMembership)(userId, organizationId);
            if (!membership) {
                return [];
            }
            // Return basic permissions based on role
            if (membership.role === 'owner' || membership.role === 'admin') {
                return ['read', 'write', 'delete', 'manage_members'];
            }
            return ['read'];
        }
        catch (error) {
            return [];
        }
    }
    /**
     * Get user's role in organization
     */
    static async getUserRole(userId, organizationId) {
        try {
            const membership = await (0, tenant_middleware_1.getUserMembership)(userId, organizationId);
            if (!membership) {
                return null;
            }
            return membership.role;
        }
        catch (error) {
            return null;
        }
    }
}
exports.PermissionChecker = PermissionChecker;
exports.default = PermissionChecker;
//# sourceMappingURL=checker.js.map