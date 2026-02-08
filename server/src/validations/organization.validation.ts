import { z } from 'zod';
import { ORG_ROLES, LEGACY_ROLES } from '../config/constants';

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, 'Organization name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  description: z
    .string()
    .optional(),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug cannot exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
});

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, 'Organization name is required')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  settings: z
    .object({
      timezone: z.string().optional(),
      dateFormat: z.string().optional(),
      language: z.string().optional(),
    })
    .optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z
    .enum([
      ...Object.values(ORG_ROLES),
      ...Object.values(LEGACY_ROLES),
    ] as [string, ...string[]])
    .optional()
    .default(ORG_ROLES.EMPLOYEE),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum([
    ...Object.values(ORG_ROLES),
    ...Object.values(LEGACY_ROLES),
  ] as [string, ...string[]]),
});
