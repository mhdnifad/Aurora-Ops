import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
// import ValidationError } from '../utils/errors';

/**
 * Validate request using express-validator
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => ({
        field: 'param' in error ? error.param : 'unknown',
        message: error.msg,
      }));

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    next();
  };
};

/**
 * Validate using Zod schema
 */
export const validateZod = (schema: any, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req[source];
      const validated = await schema.parseAsync(data);
      req[source] = validated;
      next();
    } catch (error: any) {
      const errors = error.errors?.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      })) || [];

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }
  };
};

// Backwards-compatible alias
export const validationMiddleware = validateZod;
