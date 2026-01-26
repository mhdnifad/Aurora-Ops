import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        _id: string;
        email: string;
        organizationId?: string;
    };
    organizationId?: string;
    file?: any;
    sessionId?: string;
}
/**
 * Authenticate user from JWT token
 */
export declare const authenticate: (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Optional authentication (doesn't throw error if no token)
 */
export declare const optionalAuthenticate: (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
export declare const authMiddleware: (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
export declare const authenticateToken: (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map