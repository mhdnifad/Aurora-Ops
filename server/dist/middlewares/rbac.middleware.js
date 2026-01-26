"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rbacMiddleware = exports.requireAdmin = exports.requireOwner = exports.requireRole = exports.requirePermission = void 0;
const errors_1 = require("../utils/errors");
const tenant_middleware_1 = require("./tenant.middleware");
/**
 * Check if user has required permission
 */
const requirePermission = (...permissions) => {
    return async (req, _res, next) => {
        try {
            if (!req.user || !req.user.organizationId) {
                throw new errors_1.AuthorizationError('Authentication and organization context required');
            }
            const membership = await (0, tenant_middleware_1.getUserMembership)(req.user.userId, req.user.organizationId);
            if (!membership) {
                throw new errors_1.AuthorizationError('Access denied');
            }
            // Check if user role is admin, owner, or member (members can perform general tasks)
            const hasPermission = ['admin', 'owner', 'member'].includes(membership.role);
            if (!hasPermission) {
                throw new errors_1.AuthorizationError(`Missing required permissions: ${permissions.join(', ')}`);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requirePermission = requirePermission;
/**
 * Check if user has specific role
 */
const requireRole = (...roles) => {
    return async (req, _res, next) => {
        try {
            if (!req.user || !req.user.organizationId) {
                throw new errors_1.AuthorizationError('Authentication and organization context required');
            }
            const membership = await (0, tenant_middleware_1.getUserMembership)(req.user.userId, req.user.organizationId);
            if (!membership) {
                throw new errors_1.AuthorizationError('Access denied');
            }
            const hasRole = roles.includes(membership.role);
            if (!hasRole) {
                throw new errors_1.AuthorizationError(`Required roles: ${roles.join(', ')}`);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireRole = requireRole;
/**
 * Check if user is organization owner
 */
exports.requireOwner = (0, exports.requireRole)('owner');
/**
 * Check if user is admin or owner
 */
exports.requireAdmin = (0, exports.requireRole)('owner', 'admin');
// Backwards-compatible alias
exports.rbacMiddleware = exports.requirePermission;
//# sourceMappingURL=rbac.middleware.js.map