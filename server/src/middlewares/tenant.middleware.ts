import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { AuthorizationError } from '../utils/errors';
import Membership from '../models/Membership';

/**
 * Extract organization ID from request (params, query, headers, body)
 */
const getOrganizationId = (req: AuthRequest): string | null => {
  // Prioritize explicit organizationId param for organization routes
  if (req.params.organizationId) {
    const orgId = req.params.organizationId;
    if (Array.isArray(orgId)) {
      return orgId[0] || null;
    }
    return orgId;
  }

  // Check for explicit organizationId in query or body
  if (req.query.organizationId as string) {
    return req.query.organizationId as string;
  }
  if (req.body.organizationId) {
    return req.body.organizationId;
  }

  // Most reliable: get from client header (sent with every request in browser context)
  const headerOrgId = req.headers['x-organization-id'] as string;
  if (headerOrgId) {
    return headerOrgId;
  }

  // Fallback: use user's default organization if already set
  if (req.user?.organizationId) {
    return req.user.organizationId;
  }

  // Note: req.params.id is NOT a reliable source for organizationId because:
  // - For /projects/:id, it's the PROJECT ID
  // - For /organizations/:id, it's the ORGANIZATION ID
  // - For /tasks/:id, it's the TASK ID
  // So we don't use it here

  return null;
};

/**
 * Tenant middleware: Ensures user has access to the organization
 */
export const tenantMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    let organizationId = getOrganizationId(req);

    // If no organization ID is provided, try to get user's first active organization
    if (!organizationId) {
      const membership = await Membership.findOne({
        userId: req.user.userId,
        status: 'active',
      }).sort({ createdAt: 1 }); // Get the first/oldest membership

      if (!membership) {
        throw new AuthorizationError('No active organization found. Please create or join an organization.');
      }

      organizationId = membership.organizationId.toString();
    }

    // Check if user is a member of the organization
    const membership = await Membership.findOne({
      userId: req.user.userId,
      organizationId,
      status: 'active',
    });

    if (!membership) {
      throw new AuthorizationError('Access denied to this organization');
    }

    // Attach organization context to request
    req.user.organizationId = organizationId;
    req.organizationId = organizationId;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's membership in current organization
 */
export const getUserMembership = async (
  userId: string,
  organizationId: string
) => {
  const membership = await Membership.findOne({
    userId,
    organizationId,
    status: 'active',
  });

  return membership;
};
