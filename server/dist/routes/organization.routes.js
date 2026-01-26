"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const organization_controller_1 = require("../controllers/organization.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const tenant_middleware_1 = require("../middlewares/tenant.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const audit_middleware_1 = require("../middlewares/audit.middleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_middleware_1.authenticateToken);
/**
 * Organization routes
 */
router.post('/', (0, audit_middleware_1.auditOrganization)('create'), organization_controller_1.createOrganization);
router.get('/', organization_controller_1.getUserOrganizations);
router.get('/:id', organization_controller_1.getOrganization);
router.put('/:id', tenant_middleware_1.tenantMiddleware, (0, rbac_middleware_1.requirePermission)('update_organization'), (0, audit_middleware_1.auditOrganization)('update'), organization_controller_1.updateOrganization);
router.delete('/:id', tenant_middleware_1.tenantMiddleware, (0, audit_middleware_1.auditOrganization)('delete'), organization_controller_1.deleteOrganization);
router.post('/:id/leave', tenant_middleware_1.tenantMiddleware, organization_controller_1.leaveOrganization);
/**
 * Member routes
 */
router.get('/:id/members', tenant_middleware_1.tenantMiddleware, organization_controller_1.getOrganizationMembers);
router.post('/:id/members/invite', tenant_middleware_1.tenantMiddleware, (0, rbac_middleware_1.requirePermission)('manage_members'), organization_controller_1.inviteMember);
router.put('/:id/members/:memberId', tenant_middleware_1.tenantMiddleware, (0, rbac_middleware_1.requirePermission)('manage_members'), organization_controller_1.updateMemberRole);
router.delete('/:id/members/:memberId', tenant_middleware_1.tenantMiddleware, (0, rbac_middleware_1.requirePermission)('manage_members'), organization_controller_1.removeMember);
exports.default = router;
//# sourceMappingURL=organization.routes.js.map