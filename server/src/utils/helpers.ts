import { Response, Request, NextFunction } from 'express';
import { HTTP_STATUS } from '../config/constants';

/**
 * Success response helper
 */
export const successResponse = (
  res: Response,
  data: unknown = null,
  message: string = 'Success',
  statusCode: number = HTTP_STATUS.OK
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Error response helper
 */
export const errorResponse = (
  res: Response,
  message: string = 'Error occurred',
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors: unknown = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

/**
 * Pagination helper
 */
export const paginate = (page: number = 1, limit: number = 20) => {
  const pageNum = Math.max(1, page);
  const limitNum = Math.min(Math.max(1, limit), 100);
  const skip = (pageNum - 1) * limitNum;

  return { skip, limit: limitNum, page: pageNum };
};

/**
 * Generate pagination metadata
 */
export const paginationMeta = (
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Generate slug from string
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Generate random string
 */
export const randomString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Mask email for privacy
 */
export const maskEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }
  return `${username.slice(0, 2)}***@${domain}`;
};

/**
 * Parse boolean from string
 */
export const parseBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
};

/**
 * Async handler wrapper for controllers
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Deep merge objects
 */
export const deepMerge = (target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> => {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
};

/**
 * Check if value is object
 */
const isObject = (item: unknown): boolean => {
  return item != null && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Remove undefined values from object
 */
export const removeUndefined = (obj: Record<string, unknown>): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
};

/**
 * Get client IP address
 */
export const getClientIp = (req: Request): string => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const forwarded = typeof forwardedFor === 'string' ? forwardedFor.split(',')[0] : undefined;
  const realIp = req.headers['x-real-ip'];
  
  return (
    forwarded ||
    (typeof realIp === 'string' ? realIp : undefined) ||
    req.socket?.remoteAddress ||
    'unknown'
  );
};

/**
 * Format date to ISO string
 */
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

/**
 * Add days to date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Check if date is in the past
 */
export const isPast = (date: Date): boolean => {
  return date.getTime() < Date.now();
};

/**
 * Sanitize user object (remove sensitive fields)
 */
export const sanitizeUser = (user: { toObject?: () => Record<string, unknown>; password?: unknown; __v?: unknown } & Record<string, unknown>) => {
  const { password: _password, __v: _v, ...sanitized } = user.toObject ? user.toObject() : user;
  void _password; // Mark as intentionally unused
  void _v; // Mark as intentionally unused
  return sanitized;
};
