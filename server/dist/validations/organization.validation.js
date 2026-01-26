"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMemberRoleSchema = exports.inviteMemberSchema = exports.updateOrganizationSchema = exports.createOrganizationSchema = void 0;
const zod_1 = require("zod");
exports.createOrganizationSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, 'Organization name is required')
        .max(100, 'Name cannot exceed 100 characters'),
    slug: zod_1.z
        .string()
        .min(3, 'Slug must be at least 3 characters')
        .max(50, 'Slug cannot exceed 50 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
        .optional(),
});
exports.updateOrganizationSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, 'Organization name is required')
        .max(100, 'Name cannot exceed 100 characters')
        .optional(),
    settings: zod_1.z
        .object({
        timezone: zod_1.z.string().optional(),
        dateFormat: zod_1.z.string().optional(),
        language: zod_1.z.string().optional(),
    })
        .optional(),
});
exports.inviteMemberSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    role: zod_1.z.enum(['owner', 'admin', 'member', 'viewer']).optional().default('member'),
});
exports.updateMemberRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(['owner', 'admin', 'member', 'viewer']),
});
//# sourceMappingURL=organization.validation.js.map