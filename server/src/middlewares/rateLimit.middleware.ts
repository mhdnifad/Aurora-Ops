import rateLimit from 'express-rate-limit';
import redis from '../config/redis';
import { RATE_LIMITS } from '../config/constants';
import { getClientIp } from '../utils/helpers';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: RATE_LIMITS.API.WINDOW_MS,
  max: RATE_LIMITS.API.MAX,
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
export const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.WINDOW_MS,
  max: RATE_LIMITS.AUTH.MAX,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Custom Redis-based rate limiter
 */
export const customRateLimiter = (options: {
  windowMs: number;
  max: number;
  keyGenerator?: (req: any) => string;
}) => {
  return async (req: any, res: any, next: any) => {
    try {
      const key = options.keyGenerator
        ? options.keyGenerator(req)
        : getClientIp(req);

      const count = await redis.incrementRateLimit(
        `custom:${key}`,
        options.windowMs
      );

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
    } catch (error) {
      // If Redis fails, continue without rate limiting
      next();
    }
  };
};

/**
 * Per-user rate limiter
 */
export const perUserLimiter = (options: { windowMs: number; max: number }) => {
  return customRateLimiter({
    ...options,
    keyGenerator: (req) => {
      return req.user?.userId || getClientIp(req);
    },
  });
};
