import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Project from '../models/Project';
import Task from '../models/Task';
import AuditLog from '../models/AuditLog';
import { asyncHandler, paginationMeta, getClientIp } from '../utils/helpers';
import { NotFoundError, ValidationError } from '../utils/errors';

export const getSystemStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    totalUsers,
    activeUsers,
    totalOrganizations,
    activeOrganizations,
    totalProjects,
    totalTasks,
  ] = await Promise.all([
    User.countDocuments({ deletedAt: null }),
    User.countDocuments({ deletedAt: null, isActive: true }),
    Organization.countDocuments({ deletedAt: null }),
    Organization.countDocuments({ deletedAt: null, subscriptionStatus: { $ne: 'canceled' } }),
    Project.countDocuments({ deletedAt: null }),
    Task.countDocuments({ deletedAt: null }),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      totalOrganizations,
      activeOrganizations,
      totalProjects,
      totalTasks,
    },
  });
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 50);
  const search = (req.query.search as string | undefined)?.trim();

  const filter: Record<string, unknown> = { deletedAt: null };
  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(filter)
    .select('firstName lastName email avatar isActive createdAt systemRole')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: users,
    pagination: paginationMeta(total, page, limit),
  });
});

export const getAllOrganizations = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 50);
  const search = (req.query.search as string | undefined)?.trim();

  const filter: Record<string, unknown> = { deletedAt: null };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
    ];
  }

  const organizations = await Organization.find(filter)
    .select('name slug plan subscriptionStatus createdAt')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Organization.countDocuments(filter);

  res.json({
    success: true,
    data: organizations,
    pagination: paginationMeta(total, page, limit),
  });
});

export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 50);
  const action = (req.query.action as string | undefined)?.trim();
  const resourceType = (req.query.resourceType as string | undefined)?.trim();

  const filter: Record<string, unknown> = { deletedAt: null };
  if (action) {
    filter.action = action;
  }
  if (resourceType) {
    filter.entityType = resourceType;
  }

  const logs = await AuditLog.find(filter)
    .populate('userId', 'firstName lastName email')
    .populate('organizationId', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await AuditLog.countDocuments(filter);

  res.json({
    success: true,
    data: logs,
    pagination: paginationMeta(total, page, limit),
  });
});

export const deactivateUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params as { userId: string };

  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json({ success: true, data: { id: user._id, isActive: user.isActive } });
});

export const activateUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params as { userId: string };

  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json({ success: true, data: { id: user._id, isActive: user.isActive } });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params as { userId: string };

  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { deletedAt: new Date(), isActive: false },
    { new: true }
  );

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json({ success: true, data: { id: user._id } });
});

export const getAdminContext = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  res.json({ success: true, data: { ip } });
});
