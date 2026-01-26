import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
/**
 * Tenant middleware: Ensures user has access to the organization
 */
export declare const tenantMiddleware: (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Get user's membership in current organization
 */
export declare const getUserMembership: (userId: string, organizationId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/Membership").IMembership, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Membership").IMembership & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | null>;
//# sourceMappingURL=tenant.middleware.d.ts.map