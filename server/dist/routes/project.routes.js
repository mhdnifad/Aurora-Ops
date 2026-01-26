"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const project_controller_1 = require("../controllers/project.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const tenant_middleware_1 = require("../middlewares/tenant.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const audit_middleware_1 = require("../middlewares/audit.middleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_middleware_1.authenticateToken);
/**
 * Project routes
 */
router.post('/', tenant_middleware_1.tenantMiddleware, (0, rbac_middleware_1.requirePermission)('create_project'), (0, audit_middleware_1.auditProject)('create'), project_controller_1.createProject);
router.get('/', tenant_middleware_1.tenantMiddleware, project_controller_1.getProjects);
router.get('/:id', tenant_middleware_1.tenantMiddleware, project_controller_1.getProject);
router.put('/:id', tenant_middleware_1.tenantMiddleware, (0, rbac_middleware_1.requirePermission)('update_project'), (0, audit_middleware_1.auditProject)('update'), project_controller_1.updateProject);
router.delete('/:id', tenant_middleware_1.tenantMiddleware, (0, rbac_middleware_1.requirePermission)('delete_project'), (0, audit_middleware_1.auditProject)('delete'), project_controller_1.deleteProject);
router.post('/:id/archive', tenant_middleware_1.tenantMiddleware, (0, rbac_middleware_1.requirePermission)('delete_project'), (0, audit_middleware_1.auditProject)('update'), project_controller_1.archiveProject);
router.post('/:id/unarchive', tenant_middleware_1.tenantMiddleware, (0, rbac_middleware_1.requirePermission)('delete_project'), (0, audit_middleware_1.auditProject)('update'), project_controller_1.unarchiveProject);
router.get('/:id/stats', tenant_middleware_1.tenantMiddleware, project_controller_1.getProjectStats);
/**
 * Project member routes
 */
router.post('/:id/members/invite', tenant_middleware_1.tenantMiddleware, project_controller_1.inviteProjectMember);
router.get('/:id/members', tenant_middleware_1.tenantMiddleware, project_controller_1.getProjectMembers);
router.delete('/:id/members/:memberId', tenant_middleware_1.tenantMiddleware, project_controller_1.removeProjectMember);
exports.default = router;
//# sourceMappingURL=project.routes.js.map