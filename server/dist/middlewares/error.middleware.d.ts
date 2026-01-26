import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
/**
 * Error handler middleware
 */
export declare const errorHandler: (error: Error | AppError, req: Request, res: Response, _next: NextFunction) => Response<any, Record<string, any>>;
/**
 * 404 Not Found handler
 */
export declare const notFoundHandler: (req: Request, res: Response, _next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=error.middleware.d.ts.map