import { Response, NextFunction } from 'express';
import Membership from '../models/Membership';
import { normalizeOrgRole } from '../utils/roles';
import { AppError } from '../utils/errors';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const organizationId = req.headers['x-organization-id'] as string;

    if (!organizationId) {
      throw new AppError('Organization ID is required', 400);
    }

    const membership = await Membership.findOne({
      userId,
      organizationId,
      status: 'active',
      deletedAt: null,
    });

    if (!membership) {
      throw new AppError('You are not a member of this organization', 403);
    }

    res.status(200).json({
      success: true,
      data: {
        role: normalizeOrgRole(membership.role) || membership.role,
        organizationId: membership.organizationId,
        userId: membership.userId,
      },
    });
  } catch (error) {
    next(error);
  }
};

