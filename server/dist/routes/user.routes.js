"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const membership_controller_1 = require("../controllers/membership.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const fileUpload_middleware_1 = require("../middlewares/fileUpload.middleware");
const tenant_middleware_1 = require("../middlewares/tenant.middleware");
const audit_middleware_1 = require("../middlewares/audit.middleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_middleware_1.authenticateToken);
/**
 * Profile routes
 */
router.get('/profile', user_controller_1.getUserProfile);
router.put('/profile', (0, audit_middleware_1.auditLog)('update', 'user'), user_controller_1.updateUserProfile);
router.post('/profile/avatar', fileUpload_middleware_1.uploadMemory.single('file'), (0, audit_middleware_1.auditLog)('update', 'user'), user_controller_1.uploadAvatar);
router.put('/profile/avatar', fileUpload_middleware_1.uploadMemory.single('file'), (0, audit_middleware_1.auditLog)('update', 'user'), user_controller_1.uploadAvatar);
router.delete('/profile/avatar', (0, audit_middleware_1.auditLog)('update', 'user'), user_controller_1.removeAvatar);
/**
 * User role route
 */
router.get('/role', membership_controller_1.getUserRole);
/**
 * Preferences routes
 */
router.get('/preferences', user_controller_1.getUserPreferences);
router.put('/preferences', (0, audit_middleware_1.auditLog)('update', 'user'), user_controller_1.updateUserPreferences);
/**
 * API Keys routes
 */
router.get('/api-keys', user_controller_1.listApiKeys);
router.post('/api-keys', user_controller_1.createApiKey);
router.delete('/api-keys/:id', user_controller_1.revokeApiKey);
/**
 * Activity routes
 */
router.get('/activity', user_controller_1.getUserActivity);
/**
 * Session routes
 */
router.get('/sessions', user_controller_1.getUserSessions);
router.delete('/sessions/:sessionId', user_controller_1.logoutFromSession);
router.post('/sessions/logout-all', user_controller_1.logoutFromAllSessions);
/**
 * Account routes
 */
router.post('/deactivate', user_controller_1.deactivateAccount);
/**
 * Stats routes
 */
router.get('/stats', tenant_middleware_1.tenantMiddleware, user_controller_1.getUserStats);
exports.default = router;
//# sourceMappingURL=user.routes.js.map