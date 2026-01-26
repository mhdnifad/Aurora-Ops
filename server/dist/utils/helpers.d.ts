import { Response } from 'express';
/**
 * Success response helper
 */
export declare const successResponse: (res: Response, data?: any, message?: string, statusCode?: number) => Response<any, Record<string, any>>;
/**
 * Error response helper
 */
export declare const errorResponse: (res: Response, message?: string, statusCode?: number, errors?: any) => Response<any, Record<string, any>>;
/**
 * Pagination helper
 */
export declare const paginate: (page?: number, limit?: number) => {
    skip: number;
    limit: number;
    page: number;
};
/**
 * Generate pagination metadata
 */
export declare const paginationMeta: (total: number, page: number, limit: number) => {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};
/**
 * Generate slug from string
 */
export declare const slugify: (text: string) => string;
/**
 * Generate random string
 */
export declare const randomString: (length?: number) => string;
/**
 * Mask email for privacy
 */
export declare const maskEmail: (email: string) => string;
/**
 * Parse boolean from string
 */
export declare const parseBoolean: (value: any) => boolean;
/**
 * Async handler wrapper for controllers
 */
export declare const asyncHandler: (fn: Function) => (req: any, res: any, next: any) => void;
/**
 * Deep merge objects
 */
export declare const deepMerge: (target: any, source: any) => any;
/**
 * Remove undefined values from object
 */
export declare const removeUndefined: (obj: any) => any;
/**
 * Get client IP address
 */
export declare const getClientIp: (req: any) => string;
/**
 * Format date to ISO string
 */
export declare const formatDate: (date: Date) => string;
/**
 * Add days to date
 */
export declare const addDays: (date: Date, days: number) => Date;
/**
 * Check if date is in the past
 */
export declare const isPast: (date: Date) => boolean;
/**
 * Sanitize user object (remove sensitive fields)
 */
export declare const sanitizeUser: (user: any) => any;
//# sourceMappingURL=helpers.d.ts.map