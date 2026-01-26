import express from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  archiveProject,
  unarchiveProject,
  deleteProject,
  getProjectStats,
  inviteProjectMember,
  getProjectMembers,
  removeProjectMember,
} from '../controllers/project.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { tenantMiddleware } from '../middlewares/tenant.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { auditProject } from '../middlewares/audit.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * Project routes
 */
router.post('/', tenantMiddleware, requirePermission('create_project'), auditProject('create'), createProject);
router.get('/', tenantMiddleware, getProjects);
router.get('/:id', tenantMiddleware, getProject);
router.put('/:id', tenantMiddleware, requirePermission('update_project'), auditProject('update'), updateProject);
router.delete('/:id', tenantMiddleware, requirePermission('delete_project'), auditProject('delete'), deleteProject);
router.post('/:id/archive', tenantMiddleware, requirePermission('delete_project'), auditProject('update'), archiveProject);
router.post('/:id/unarchive', tenantMiddleware, requirePermission('delete_project'), auditProject('update'), unarchiveProject);
router.get('/:id/stats', tenantMiddleware, getProjectStats);

/**
 * Project member routes
 */
router.post('/:id/members/invite', tenantMiddleware, inviteProjectMember);
router.get('/:id/members', tenantMiddleware, getProjectMembers);
router.delete('/:id/members/:memberId', tenantMiddleware, removeProjectMember);

export default router;
