import express from 'express';
import {
  createTask,
  getProjectTasks,
  getMyTasks,
  getTask,
  updateTask,
  deleteTask,
  createComment,
  getTaskComments,
  updateComment,
  deleteComment,
} from '../controllers/task.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { tenantMiddleware } from '../middlewares/tenant.middleware';
import { uploadMemory } from '../middlewares/fileUpload.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { auditTask } from '../middlewares/audit.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * Task routes
 */
router.post('/', tenantMiddleware, requirePermission('create_task'), auditTask('create'), createTask);
router.get('/my/tasks', tenantMiddleware, getMyTasks);
router.get('/project/:projectId', tenantMiddleware, getProjectTasks);
router.get('/:id', tenantMiddleware, getTask);
router.put('/:id', tenantMiddleware, requirePermission('update_task'), auditTask('update'), updateTask);
router.delete('/:id', tenantMiddleware, requirePermission('delete_task'), auditTask('delete'), deleteTask);

/**
 * Attachment routes
 */
import { uploadAttachment, deleteAttachment } from '../controllers/task.controller';
router.post('/:id/attachments', tenantMiddleware, requirePermission('update_task'), uploadMemory.single('file'), uploadAttachment);
router.delete('/:id/attachments/:attachmentId', tenantMiddleware, requirePermission('update_task'), deleteAttachment);

/**
 * Comment routes
 */
router.post('/:id/comments', tenantMiddleware, createComment);
router.get('/:id/comments', tenantMiddleware, getTaskComments);
router.put('/:id/comments/:commentId', tenantMiddleware, updateComment);
router.delete('/:id/comments/:commentId', tenantMiddleware, deleteComment);

export default router;
