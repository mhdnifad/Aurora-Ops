import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../utils/jwt';
import { AuthenticationError } from '../utils/errors';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    _id: string;  // Alias for userId for compatibility
    email: string;
    organizationId?: string;
    systemRole?: string;
  };
  organizationId?: string;  // For tenant middleware
  file?: Express.Multer.File;  // For file uploads
  sessionId?: string;  // For session tracking
}

/**
 * Authenticate user from JWT token
 */
export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = JWTUtil.verifyAccessToken(token);

    // Check if user exists
    const user = await User.findById(decoded.userId);
    
    if (!user || user.deletedAt) {
      throw new AuthenticationError('User not found');
    }

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      _id: decoded.userId,  // Alias for compatibility
      email: decoded.email,
      organizationId: decoded.organizationId,
      systemRole: user.systemRole,
    };

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      next(new AuthenticationError('Invalid or expired token'));
    }
  }
};

/**
 * Optional authentication (doesn't throw error if no token)
 */
export const optionalAuthenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = JWTUtil.verifyAccessToken(token);

    const user = await User.findById(decoded.userId);
    
    if (user && !user.deletedAt) {
      req.user = {
        userId: decoded.userId,
        _id: decoded.userId,  // Alias for compatibility
        email: decoded.email,
        organizationId: decoded.organizationId,
        systemRole: user.systemRole,
      };
    }

    next();
  } catch {
    // Continue without authentication
    next();
  }
};

// Backwards-compatible aliases
export const authMiddleware = authenticate;
export const authenticateToken = authenticate;
