import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
/**
 * Validate request using express-validator
 */
export declare const validate: (validations: ValidationChain[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Validate using Zod schema
 */
export declare const validateZod: (schema: any, source?: "body" | "query" | "params") => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const validationMiddleware: (schema: any, source?: "body" | "query" | "params") => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validation.middleware.d.ts.map