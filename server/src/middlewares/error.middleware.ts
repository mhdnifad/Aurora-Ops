import { Request, Response } from 'express';
import { AppError } from '../utils/errors';
import { HTTP_STATUS } from '../config/constants';
import logger from '../utils/logger';
import config from '../config/env';

/**
 * Error handler middleware
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  /* _next: NextFunction */
) => {
  // Log error
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Check if error is operational
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: error.message,
    });
  }

  // Handle Multer (file upload) errors
  if (error.name === 'MulterError') {
    const code = (error as { code?: string }).code;
    if (code === 'LIMIT_FILE_SIZE') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.',
      });
    }
    if (code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Unexpected file field in upload.',
      });
    }
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'File upload error',
    });
  }

  // Handle Mongoose duplicate key errors
  if (error.name === 'MongoServerError' && (error as { code?: number }).code === 11000) {
    const mongoError = error as unknown as { keyPattern: Record<string, unknown> };
    const field = Object.keys(mongoError.keyPattern)[0];
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Handle Mongoose cast errors
  if (error.name === 'CastError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Invalid ID format',
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Token expired',
    });
  }

  // Default to 500 server error
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: config.env === 'development' ? error.message : 'Internal server error',
    ...(config.env === 'development' && { stack: error.stack }),
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  /* _next: NextFunction */
) => {
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};
