"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommentSchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../config/constants");
exports.createTaskSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'Project ID is required'),
    title: zod_1.z
        .string()
        .min(1, 'Task title is required')
        .max(300, 'Title cannot exceed 300 characters'),
    description: zod_1.z
        .string()
        .max(5000, 'Description cannot exceed 5000 characters')
        .optional()
        .default(''),
    status: zod_1.z
        .enum([constants_1.TASK_STATUS.TODO, constants_1.TASK_STATUS.IN_PROGRESS, constants_1.TASK_STATUS.REVIEW, constants_1.TASK_STATUS.DONE])
        .optional()
        .default(constants_1.TASK_STATUS.TODO),
    priority: zod_1.z
        .enum([constants_1.TASK_PRIORITY.LOW, constants_1.TASK_PRIORITY.MEDIUM, constants_1.TASK_PRIORITY.HIGH, constants_1.TASK_PRIORITY.URGENT])
        .optional()
        .default(constants_1.TASK_PRIORITY.MEDIUM),
    assigneeId: zod_1.z.string().optional().nullable(),
    dueDate: zod_1.z.string().datetime().optional().nullable(),
    tags: zod_1.z.array(zod_1.z.string()).optional().default([]),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(1, 'Task title is required')
        .max(300, 'Title cannot exceed 300 characters')
        .optional(),
    description: zod_1.z
        .string()
        .max(5000, 'Description cannot exceed 5000 characters')
        .optional(),
    status: zod_1.z
        .enum([constants_1.TASK_STATUS.TODO, constants_1.TASK_STATUS.IN_PROGRESS, constants_1.TASK_STATUS.REVIEW, constants_1.TASK_STATUS.DONE])
        .optional(),
    priority: zod_1.z
        .enum([constants_1.TASK_PRIORITY.LOW, constants_1.TASK_PRIORITY.MEDIUM, constants_1.TASK_PRIORITY.HIGH, constants_1.TASK_PRIORITY.URGENT])
        .optional(),
    assigneeId: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.createCommentSchema = zod_1.z.object({
    content: zod_1.z
        .string()
        .min(1, 'Comment content is required')
        .max(5000, 'Comment cannot exceed 5000 characters'),
    mentions: zod_1.z.array(zod_1.z.string()).optional().default([]),
});
//# sourceMappingURL=task.validation.js.map