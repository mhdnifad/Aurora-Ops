"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const task_controller_1 = require("../controllers/task.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const tenant_middleware_1 = require("../middlewares/tenant.middleware");
const fileUpload_middleware_1 = require("../middlewares/fileUpload.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const audit_middleware_1 = require("../middlewares/audit.middleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_middleware_1.authenticateToken);
/**
 * Task routes
 */
router.post('/', tenant_middleware_1.tenantMiddleware, (0, rbac_middleware_1.requirePermission)('create_task'), (0, audit_middleware_1.auditTask)('create'), task_controller_1.createTask);
router.get('/my/tasks', tenant_middleware_1.tenantMiddleware, task_controller_1.getMyTasks);
router.get('/project/:projectId', tenant_middleware_1.tenantMiddleware, task_controller_1.getProjectTasks);
router.get('/:id', tenant_middleware_1.tenantMiddleware, task_controller_1.getTask);
router.put('/:id', tenant_middleware_1.tenantMiddleware, (0, rbac_middleware_1.requirePermission)('update_task'), (0, audit_middleware_1.auditTask)('update'), task_controller_1.updateTask);
router.delete('/:id', tenant_middleware_1.tenantMiddleware, (0, rbac_middleware_1.requirePermission)('delete_task'), (0, audit_middleware_1.auditTask)('delete'), task_controller_1.deleteTask);
/**
 * Attachment routes
 */
const task_controller_2 = require("../controllers/task.controller");
router.post('/:id/attachments', tenant_middleware_1.tenantMiddleware, (0, rbac_middleware_1.requirePermission)('update_task'), fileUpload_middleware_1.uploadMemory.single('file'), task_controller_2.uploadAttachment);
router.delete('/:id/attachments/:attachmentId', tenant_middleware_1.tenantMiddleware, (0, rbac_middleware_1.requirePermission)('update_task'), task_controller_2.deleteAttachment);
/**
 * Comment routes
 */
router.post('/:id/comments', tenant_middleware_1.tenantMiddleware, task_controller_1.createComment);
router.get('/:id/comments', tenant_middleware_1.tenantMiddleware, task_controller_1.getTaskComments);
router.put('/:id/comments/:commentId', tenant_middleware_1.tenantMiddleware, task_controller_1.updateComment);
router.delete('/:id/comments/:commentId', tenant_middleware_1.tenantMiddleware, task_controller_1.deleteComment);
exports.default = router;
//# sourceMappingURL=task.routes.js.map