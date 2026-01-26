"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationMiddleware = exports.validateZod = exports.validate = void 0;
const express_validator_1 = require("express-validator");
// import ValidationError } from '../utils/errors';
/**
 * Validate request using express-validator
 */
const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map((validation) => validation.run(req)));
        // Check for errors
        const errors = (0, express_validator_1.validationResult)(req);
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
exports.validate = validate;
/**
 * Validate using Zod schema
 */
const validateZod = (schema, source = 'body') => {
    return async (req, res, next) => {
        try {
            const data = req[source];
            const validated = await schema.parseAsync(data);
            req[source] = validated;
            next();
        }
        catch (error) {
            const errors = error.errors?.map((err) => ({
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
exports.validateZod = validateZod;
// Backwards-compatible alias
exports.validationMiddleware = exports.validateZod;
//# sourceMappingURL=validation.middleware.js.map