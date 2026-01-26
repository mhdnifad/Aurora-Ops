import { z } from 'zod';
import { PROJECT_STATUS } from '../config/constants';

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(200, 'Name cannot exceed 200 characters'),
  description: z
    .string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional()
    .default(''),
  status: z.enum([PROJECT_STATUS.ACTIVE, PROJECT_STATUS.ARCHIVED]).optional(),
  members: z.array(z.string()).optional().default([]),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(200, 'Name cannot exceed 200 characters')
    .optional(),
  description: z
    .string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  status: z.enum([PROJECT_STATUS.ACTIVE, PROJECT_STATUS.ARCHIVED]).optional(),
  members: z.array(z.string()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
