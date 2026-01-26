import { z } from 'zod';
import { TASK_STATUS, TASK_PRIORITY } from '../config/constants';

export const createTaskSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(300, 'Title cannot exceed 300 characters'),
  description: z
    .string()
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional()
    .default(''),
  status: z
    .enum([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.REVIEW, TASK_STATUS.DONE])
    .optional()
    .default(TASK_STATUS.TODO),
  priority: z
    .enum([TASK_PRIORITY.LOW, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.HIGH, TASK_PRIORITY.URGENT])
    .optional()
    .default(TASK_PRIORITY.MEDIUM),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(300, 'Title cannot exceed 300 characters')
    .optional(),
  description: z
    .string()
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional(),
  status: z
    .enum([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.REVIEW, TASK_STATUS.DONE])
    .optional(),
  priority: z
    .enum([TASK_PRIORITY.LOW, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.HIGH, TASK_PRIORITY.URGENT])
    .optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment content is required')
    .max(5000, 'Comment cannot exceed 5000 characters'),
  mentions: z.array(z.string()).optional().default([]),
});
