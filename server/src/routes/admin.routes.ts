import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import {
  getSystemStats,
  getAllUsers,
  getAllOrganizations,
  getAuditLogs,
  deactivateUser,
  activateUser,
  deleteUser,
  getAdminContext,
} from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/system/stats', getSystemStats);
router.get('/users', getAllUsers);
router.get('/organizations', getAllOrganizations);
router.get('/audit-logs', getAuditLogs);
router.get('/context', getAdminContext);

router.post('/users/:userId/deactivate', deactivateUser);
router.post('/users/:userId/activate', activateUser);
router.delete('/users/:userId', deleteUser);

export default router;
