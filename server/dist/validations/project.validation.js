"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../config/constants");
exports.createProjectSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, 'Project name is required')
        .max(200, 'Name cannot exceed 200 characters'),
    description: zod_1.z
        .string()
        .max(2000, 'Description cannot exceed 2000 characters')
        .optional()
        .default(''),
    status: zod_1.z.enum([constants_1.PROJECT_STATUS.ACTIVE, constants_1.PROJECT_STATUS.ARCHIVED]).optional(),
    members: zod_1.z.array(zod_1.z.string()).optional().default([]),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
exports.updateProjectSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, 'Project name is required')
        .max(200, 'Name cannot exceed 200 characters')
        .optional(),
    description: zod_1.z
        .string()
        .max(2000, 'Description cannot exceed 2000 characters')
        .optional(),
    status: zod_1.z.enum([constants_1.PROJECT_STATUS.ACTIVE, constants_1.PROJECT_STATUS.ARCHIVED]).optional(),
    members: zod_1.z.array(zod_1.z.string()).optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
//# sourceMappingURL=project.validation.js.map