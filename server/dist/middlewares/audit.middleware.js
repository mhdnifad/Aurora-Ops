"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditTask = exports.auditProject = exports.auditOrganization = exports.auditAuth = exports.auditLog = void 0;
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const helpers_1 = require("../utils/helpers");
/**
 * Audit log middleware - logs all sensitive operations
 */
const auditLog = (action, entityType) => {
    return async (req, res, next) => {
        // Store original json function
        const originalJson = res.json.bind(res);
        // Override json function to log after response
        res.json = function (data) {
            // Only log if request was successful
            if (res.statusCode < 400 && req.user && req.organizationId) {
                const entityId = req.params.id || data?.data?._id || data?.data?.id;
                // Create audit log asynchronously (don't block response)
                AuditLog_1.default.create({
                    organizationId: req.organizationId,
                    userId: req.user._id,
                    action,
                    entityType,
                    entityId,
                    metadata: {
                        method: req.method,
                        path: req.path,
                        params: req.params,
                        query: req.query,
                    },
                    ipAddress: (0, helpers_1.getClientIp)(req),
                    userAgent: req.headers['user-agent'] || 'unknown',
                }).catch(() => {
                    // Log error but don't fail the request
                });
            }
            return originalJson(data);
        };
        next();
    };
};
exports.auditLog = auditLog;
/**
 * Log authentication events
 */
const auditAuth = (action) => {
    return (0, exports.auditLog)(action, 'auth');
};
exports.auditAuth = auditAuth;
/**
 * Log organization events
 */
const auditOrganization = (action) => {
    return (0, exports.auditLog)(action, 'organization');
};
exports.auditOrganization = auditOrganization;
/**
 * Log project events
 */
const auditProject = (action) => {
    return (0, exports.auditLog)(action, 'project');
};
exports.auditProject = auditProject;
/**
 * Log task events
 */
const auditTask = (action) => {
    return (0, exports.auditLog)(action, 'task');
};
exports.auditTask = auditTask;
//# sourceMappingURL=audit.middleware.js.map