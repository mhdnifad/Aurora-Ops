import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { AuthorizationError } from '../utils/errors';

export const requireAdmin = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (req.user?.systemRole !== 'admin') {
    throw new AuthorizationError('Admin access required');
  }
  next();
};
