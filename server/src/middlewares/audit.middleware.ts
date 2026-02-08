import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import AuditLog from '../models/AuditLog';
import { getClientIp } from '../utils/helpers';

/**
 * Audit log middleware - logs all sensitive operations
 */
export const auditLog = (action: string, entityType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Store original json function
    const originalJson = res.json.bind(res);

    // Override json function to log after response
    res.json = function (data: unknown) {
      // Only log if request was successful
      if (res.statusCode < 400 && req.user && req.organizationId) {
        const responseData = data as { data?: { _id?: unknown; id?: unknown } };
        const entityId = req.params.id || responseData?.data?._id || responseData?.data?.id;

        // Create audit log asynchronously (don't block response)
        AuditLog.create({
          organizationId: req.organizationId,
          userId: req.user._id,
          action,
          entityType,
          entityId: entityId ? String(entityId) : undefined,
          metadata: {
            method: req.method,
            path: req.path,
            params: req.params,
            query: req.query,
          },
          ipAddress: getClientIp(req),
          userAgent: req.headers['user-agent'] || 'unknown',
        }).catch(() => {
          // Log error but don't fail the request
        });
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Log authentication events
 */
export const auditAuth = (action: 'login' | 'logout' | 'register') => {
  return auditLog(action, 'auth');
};

/**
 * Log organization events
 */
export const auditOrganization = (action: 'create' | 'update' | 'delete') => {
  return auditLog(action, 'organization');
};

/**
 * Log project events
 */
export const auditProject = (action: 'create' | 'update' | 'delete') => {
  return auditLog(action, 'project');
};

/**
 * Log task events
 */
export const auditTask = (action: 'create' | 'update' | 'delete') => {
  return auditLog(action, 'task');
};
