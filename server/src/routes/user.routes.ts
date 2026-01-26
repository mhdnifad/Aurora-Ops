import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  removeAvatar,
  getUserPreferences,
  updateUserPreferences,
  getUserActivity,
  getUserSessions,
  logoutFromSession,
  logoutFromAllSessions,
  deactivateAccount,
  getUserStats,
  listApiKeys,
  createApiKey,
  revokeApiKey,
} from '../controllers/user.controller';
import { getUserRole } from '../controllers/membership.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { uploadMemory } from '../middlewares/fileUpload.middleware';
import { tenantMiddleware } from '../middlewares/tenant.middleware';
import { auditLog } from '../middlewares/audit.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * Profile routes
 */
router.get('/profile', getUserProfile);
router.put('/profile', auditLog('update', 'user'), updateUserProfile);
router.post('/profile/avatar', uploadMemory.single('file'), auditLog('update', 'user'), uploadAvatar);

router.put('/profile/avatar', uploadMemory.single('file'), auditLog('update', 'user'), uploadAvatar);
router.delete('/profile/avatar', auditLog('update', 'user'), removeAvatar);

/**
 * User role route
 */
router.get('/role', getUserRole);

/**
 * Preferences routes
 */
router.get('/preferences', getUserPreferences);
router.put('/preferences', auditLog('update', 'user'), updateUserPreferences);

/**
 * API Keys routes
 */
router.get('/api-keys', listApiKeys);
router.post('/api-keys', createApiKey);
router.delete('/api-keys/:id', revokeApiKey);

/**
 * Activity routes
 */
router.get('/activity', getUserActivity);

/**
 * Session routes
 */
router.get('/sessions', getUserSessions);
router.delete('/sessions/:sessionId', logoutFromSession);
router.post('/sessions/logout-all', logoutFromAllSessions);

/**
 * Account routes
 */
router.post('/deactivate', deactivateAccount);

/**
 * Stats routes
 */
router.get('/stats', tenantMiddleware, getUserStats);

export default router;
