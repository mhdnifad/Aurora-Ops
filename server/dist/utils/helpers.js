"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeUser = exports.isPast = exports.addDays = exports.formatDate = exports.getClientIp = exports.removeUndefined = exports.deepMerge = exports.asyncHandler = exports.parseBoolean = exports.maskEmail = exports.randomString = exports.slugify = exports.paginationMeta = exports.paginate = exports.errorResponse = exports.successResponse = void 0;
const constants_1 = require("../config/constants");
/**
 * Success response helper
 */
const successResponse = (res, data = null, message = 'Success', statusCode = constants_1.HTTP_STATUS.OK) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.successResponse = successResponse;
/**
 * Error response helper
 */
const errorResponse = (res, message = 'Error occurred', statusCode = constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};
exports.errorResponse = errorResponse;
/**
 * Pagination helper
 */
const paginate = (page = 1, limit = 20) => {
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(Math.max(1, limit), 100);
    const skip = (pageNum - 1) * limitNum;
    return { skip, limit: limitNum, page: pageNum };
};
exports.paginate = paginate;
/**
 * Generate pagination metadata
 */
const paginationMeta = (total, page, limit) => {
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
exports.paginationMeta = paginationMeta;
/**
 * Generate slug from string
 */
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};
exports.slugify = slugify;
/**
 * Generate random string
 */
const randomString = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
exports.randomString = randomString;
/**
 * Mask email for privacy
 */
const maskEmail = (email) => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) {
        return `${username[0]}***@${domain}`;
    }
    return `${username.slice(0, 2)}***@${domain}`;
};
exports.maskEmail = maskEmail;
/**
 * Parse boolean from string
 */
const parseBoolean = (value) => {
    if (typeof value === 'boolean')
        return value;
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
    }
    return Boolean(value);
};
exports.parseBoolean = parseBoolean;
/**
 * Async handler wrapper for controllers
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
/**
 * Deep merge objects
 */
const deepMerge = (target, source) => {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                }
                else {
                    output[key] = (0, exports.deepMerge)(target[key], source[key]);
                }
            }
            else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
};
exports.deepMerge = deepMerge;
/**
 * Check if value is object
 */
const isObject = (item) => {
    return item && typeof item === 'object' && !Array.isArray(item);
};
/**
 * Remove undefined values from object
 */
const removeUndefined = (obj) => {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
};
exports.removeUndefined = removeUndefined;
/**
 * Get client IP address
 */
const getClientIp = (req) => {
    return (req.headers['x-forwarded-for']?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        'unknown');
};
exports.getClientIp = getClientIp;
/**
 * Format date to ISO string
 */
const formatDate = (date) => {
    return date.toISOString();
};
exports.formatDate = formatDate;
/**
 * Add days to date
 */
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
exports.addDays = addDays;
/**
 * Check if date is in the past
 */
const isPast = (date) => {
    return date.getTime() < Date.now();
};
exports.isPast = isPast;
/**
 * Sanitize user object (remove sensitive fields)
 */
const sanitizeUser = (user) => {
    const { password, __v, ...sanitized } = user.toObject ? user.toObject() : user;
    return sanitized;
};
exports.sanitizeUser = sanitizeUser;
//# sourceMappingURL=helpers.js.map