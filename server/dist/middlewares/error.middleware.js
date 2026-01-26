"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const constants_1 = require("../config/constants");
const logger_1 = __importDefault(require("../utils/logger"));
const env_1 = __importDefault(require("../config/env"));
/**
 * Error handler middleware
 */
const errorHandler = (error, req, res, _next) => {
    // Log error
    logger_1.default.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
    });
    // Check if error is operational
    if (error instanceof errors_1.AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
        return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Validation failed',
            errors: error.message,
        });
    }
    // Handle Multer (file upload) errors
    if (error.name === 'MulterError') {
        const code = error.code;
        if (code === 'LIMIT_FILE_SIZE') {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'File too large. Maximum size is 10MB.',
            });
        }
        if (code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Unexpected file field in upload.',
            });
        }
        return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'File upload error',
        });
    }
    // Handle Mongoose duplicate key errors
    if (error.name === 'MongoServerError' && error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(constants_1.HTTP_STATUS.CONFLICT).json({
            success: false,
            message: `${field} already exists`,
        });
    }
    // Handle Mongoose cast errors
    if (error.name === 'CastError') {
        return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Invalid ID format',
        });
    }
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: 'Invalid token',
        });
    }
    if (error.name === 'TokenExpiredError') {
        return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: 'Token expired',
        });
    }
    // Default to 500 server error
    return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: env_1.default.env === 'development' ? error.message : 'Internal server error',
        ...(env_1.default.env === 'development' && { stack: error.stack }),
    });
};
exports.errorHandler = errorHandler;
/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, _next) => {
    return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.middleware.js.map