import express from 'express';
import {
  createOrganization,
  getUserOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  leaveOrganization,
} from '../controllers/organization.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { tenantMiddleware } from '../middlewares/tenant.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { auditOrganization } from '../middlewares/audit.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * Organization routes
 */
router.post('/', auditOrganization('create'), createOrganization);
router.get('/', getUserOrganizations);
router.get('/:id', getOrganization);
router.put('/:id', tenantMiddleware, requirePermission('update_organization'), auditOrganization('update'), updateOrganization);
router.delete('/:id', tenantMiddleware, auditOrganization('delete'), deleteOrganization);
router.post('/:id/leave', tenantMiddleware, leaveOrganization);

/**
 * Member routes
 */
router.get('/:id/members', tenantMiddleware, getOrganizationMembers);
router.post('/:id/members/invite', tenantMiddleware, requirePermission('manage_members'), inviteMember);
router.put('/:id/members/:memberId', tenantMiddleware, requirePermission('manage_members'), updateMemberRole);
router.delete('/:id/members/:memberId', tenantMiddleware, requirePermission('manage_members'), removeMember);

export default router;
