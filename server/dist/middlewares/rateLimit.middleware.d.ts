/**
 * General API rate limiter
 */
export declare const apiLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict rate limiter for authentication endpoints
 */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Custom Redis-based rate limiter
 */
export declare const customRateLimiter: (options: {
    windowMs: number;
    max: number;
    keyGenerator?: (req: any) => string;
}) => (req: any, res: any, next: any) => Promise<any>;
/**
 * Per-user rate limiter
 */
export declare const perUserLimiter: (options: {
    windowMs: number;
    max: number;
}) => (req: any, res: any, next: any) => Promise<any>;
//# sourceMappingURL=rateLimit.middleware.d.ts.map