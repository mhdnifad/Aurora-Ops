import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
/**
 * Check if user has required permission
 */
export declare const requirePermission: (...permissions: string[]) => (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Check if user has specific role
 */
export declare const requireRole: (...roles: string[]) => (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Check if user is organization owner
 */
export declare const requireOwner: (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Check if user is admin or owner
 */
export declare const requireAdmin: (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
export declare const rbacMiddleware: (...permissions: string[]) => (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=rbac.middleware.d.ts.map