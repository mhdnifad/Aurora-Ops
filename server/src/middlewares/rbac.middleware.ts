import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { AuthorizationError } from '../utils/errors';
import { DEFAULT_ROLE_PERMISSIONS, roleHasAnyPermission } from '../permissions/definitions';
import { normalizeOrgRole } from '../utils/roles';
import { PERMISSION_ALIASES } from '../config/constants';
import { getUserMembership } from './tenant.middleware';

/**
 * Check if user has required permission
 */
export const requirePermission = (...permissions: string[]) => {
  return async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (req.user?.systemRole === 'admin') {
        return next();
      }

      if (!req.user || !req.user.organizationId) {
        throw new AuthorizationError('Authentication and organization context required');
      }

      const membership = await getUserMembership(
        req.user._id,
        req.user.organizationId
      );

      if (!membership) {
        throw new AuthorizationError('Access denied');
      }

      const normalizedRole = normalizeOrgRole(membership.role);
      if (!normalizedRole) {
        throw new AuthorizationError('Invalid role');
      }

      const rolePermissions = DEFAULT_ROLE_PERMISSIONS[normalizedRole] || [];
      const resolvedPermissions = permissions.flatMap((permission) =>
        PERMISSION_ALIASES[permission] ? PERMISSION_ALIASES[permission] : [permission]
      );

      const hasPermission =
        resolvedPermissions.length === 0 ||
        roleHasAnyPermission(rolePermissions, resolvedPermissions);

      if (!hasPermission) {
        throw new AuthorizationError(
          `Missing required permissions: ${permissions.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has specific role
 */
export const requireRole = (...roles: string[]) => {
  return async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (req.user?.systemRole === 'admin') {
        return next();
      }

      if (!req.user || !req.user.organizationId) {
        throw new AuthorizationError('Authentication and organization context required');
      }

      const membership = await getUserMembership(
        req.user._id,
        req.user.organizationId
      );

      if (!membership) {
        throw new AuthorizationError('Access denied');
      }

      const normalizedRole = normalizeOrgRole(membership.role);
      const normalizedRequiredRoles = roles
        .map((role) => normalizeOrgRole(role) || role)
        .filter(Boolean);
      const hasRole = normalizedRole ? normalizedRequiredRoles.includes(normalizedRole) : false;

      if (!hasRole) {
        throw new AuthorizationError(
          `Required roles: ${roles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user is organization owner
 */
export const requireOwner = requireRole('company_admin');

/**
 * Check if user is admin or owner
 */
export const requireAdmin = requireRole('company_admin');

// Backwards-compatible alias
export const rbacMiddleware = requirePermission;

