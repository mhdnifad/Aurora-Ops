import { Request, Response, NextFunction } from 'express';
import Membership from '../models/Membership';
import { AppError } from '../utils/errors';

export const getUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?._id;
    const organizationId = req.headers['x-organization-id'] as string;

    if (!organizationId) {
      throw new AppError('Organization ID is required', 400);
    }

    const membership = await Membership.findOne({
      userId,
      organizationId,
      status: 'active',
    });

    if (!membership) {
      throw new AppError('You are not a member of this organization', 403);
    }

    res.status(200).json({
      success: true,
      data: {
        role: membership.role,
        organizationId: membership.organizationId,
        userId: membership.userId,
      },
    });
  } catch (error) {
    next(error);
  }
};
