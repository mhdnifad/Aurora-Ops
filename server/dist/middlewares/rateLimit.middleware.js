"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.perUserLimiter = exports.customRateLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const redis_1 = __importDefault(require("../config/redis"));
const constants_1 = require("../config/constants");
const helpers_1 = require("../utils/helpers");
/**
 * General API rate limiter
 */
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: constants_1.RATE_LIMITS.API.WINDOW_MS,
    max: constants_1.RATE_LIMITS.API.MAX,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/health';
    },
});
/**
 * Strict rate limiter for authentication endpoints
 */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: constants_1.RATE_LIMITS.AUTH.WINDOW_MS,
    max: constants_1.RATE_LIMITS.AUTH.MAX,
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
});
/**
 * Custom Redis-based rate limiter
 */
const customRateLimiter = (options) => {
    return async (req, res, next) => {
        try {
            const key = options.keyGenerator
                ? options.keyGenerator(req)
                : (0, helpers_1.getClientIp)(req);
            const count = await redis_1.default.incrementRateLimit(`custom:${key}`, options.windowMs);
            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', options.max);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - count));
            if (count > options.max) {
                return res.status(429).json({
                    success: false,
                    message: 'Too many requests, please try again later',
                });
            }
            next();
        }
        catch (error) {
            // If Redis fails, continue without rate limiting
            next();
        }
    };
};
exports.customRateLimiter = customRateLimiter;
/**
 * Per-user rate limiter
 */
const perUserLimiter = (options) => {
    return (0, exports.customRateLimiter)({
        ...options,
        keyGenerator: (req) => {
            return req.user?.userId || (0, helpers_1.getClientIp)(req);
        },
    });
};
exports.perUserLimiter = perUserLimiter;
//# sourceMappingURL=rateLimit.middleware.js.map