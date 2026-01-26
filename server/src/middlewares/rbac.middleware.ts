import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { AuthorizationError } from '../utils/errors';
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
      if (!req.user || !req.user.organizationId) {
        throw new AuthorizationError('Authentication and organization context required');
      }

      const membership = await getUserMembership(
        req.user.userId,
        req.user.organizationId
      );

      if (!membership) {
        throw new AuthorizationError('Access denied');
      }

      // Check if user role is admin, owner, or member (members can perform general tasks)
      const hasPermission = ['admin', 'owner', 'member'].includes(membership.role);

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
      if (!req.user || !req.user.organizationId) {
        throw new AuthorizationError('Authentication and organization context required');
      }

      const membership = await getUserMembership(
        req.user.userId,
        req.user.organizationId
      );

      if (!membership) {
        throw new AuthorizationError('Access denied');
      }

      const hasRole = roles.includes(membership.role);

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
export const requireOwner = requireRole('owner');

/**
 * Check if user is admin or owner
 */
export const requireAdmin = requireRole('owner', 'admin');

// Backwards-compatible alias
export const rbacMiddleware = requirePermission;
