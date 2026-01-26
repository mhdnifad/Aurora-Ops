import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
/**
 * Audit log middleware - logs all sensitive operations
 */
export declare const auditLog: (action: string, entityType: string) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Log authentication events
 */
export declare const auditAuth: (action: "login" | "logout" | "register") => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Log organization events
 */
export declare const auditOrganization: (action: "create" | "update" | "delete") => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Log project events
 */
export declare const auditProject: (action: "create" | "update" | "delete") => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Log task events
 */
export declare const auditTask: (action: "create" | "update" | "delete") => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=audit.middleware.d.ts.map