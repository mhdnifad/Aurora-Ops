
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import User from '../models/User';
import { asyncHandler } from '../utils/helpers';
import cloudinaryService from '../services/cloudinary.service';
import { AuthorizationError, NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import { PasswordUtil } from '../utils/password';
import crypto from 'crypto';

/**
 * Remove user avatar
 */
export const removeAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.user!._id,
    { avatar: null },
    { new: true }
  );
  if (!user) {
    throw new NotFoundError('User not found');
  }
  logger.info(`Avatar removed for user: ${user.email}`);
  res.json({
    success: true,
    data: { avatar: null },
  });
});

/**
 * Get user profile
 */
export const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json({
    success: true,
    data: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      bio: (user as any)?.bio,
      phone: (user as any)?.phone,
      isActive: (user as any)?.isActive,
      createdAt: user.createdAt,
    },
  });
});

/**
 * Update user profile
 */
export const updateUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { firstName, lastName, bio, phone } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user!._id,
    {
      firstName,
      lastName,
      bio,
      phone,
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new NotFoundError('User not found');
  }

  logger.info(`User profile updated: ${user.email}`);

  res.json({
    success: true,
    data: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      bio: (user as any)?.bio,
      phone: (user as any)?.phone,
    },
  });
});

/**
 * Upload user avatar
 */
export const uploadAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw new ValidationError('No file provided');
  }

  // Validate avatar file type (allow common image formats)
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedImageTypes.includes(req.file.mimetype)) {
    throw new ValidationError('Unsupported file type. Allowed: JPG, PNG, WEBP, GIF');
  }

  // Prefer Cloudinary uploads when configured, fallback to base64 data URL
  let uploadedUrl: string;
  
  if (cloudinaryService.isEnabled()) {
    uploadedUrl = await cloudinaryService.uploadAvatar(req.file.buffer, req.user!._id.toString());
  } else {
    // Fallback: store as base64 data URL (suitable for development)
    const base64Data = req.file.buffer.toString('base64');
    uploadedUrl = `data:${req.file.mimetype};base64,${base64Data}`;
    logger.info('Avatar stored as base64 (Cloudinary not configured)');
  }

  const user = await User.findByIdAndUpdate(
    req.user!._id,
    {
      avatar: uploadedUrl,
    },
    { new: true }
  );

  if (!user) {
    throw new NotFoundError('User not found');
  }

  logger.info(`Avatar uploaded for user: ${user.email}`);

  res.json({
    success: true,
    data: {
      avatar: user.avatar,
    },
  });
});

/**
 * Get user preferences
 */
export const getUserPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const preferences = (user as any).preferences || {};

  res.json({
    success: true,
    data: {
      theme: preferences.theme || 'light',
      language: preferences.language || 'en',
      timezone: preferences.timezone || 'UTC',
      emailDigest: preferences.emailDigest || 'daily',
      notifications: {
        email: preferences.notifications?.email !== false,
        push: preferences.notifications?.push !== false,
        inApp: preferences.notifications?.inApp !== false,
      },
    },
  });
});

/**
 * Update user preferences
 */
export const updateUserPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { theme, notifications, language, timezone, emailDigest } = req.body;

  // Store preferences in user document
  const user = await User.findByIdAndUpdate(
    req.user!._id,
    {
      preferences: {
        theme: theme || 'light',
        notifications: {
          email: notifications?.email !== false,
          push: notifications?.push !== false,
          inApp: notifications?.inApp !== false,
        },
        language: language || 'en',
        timezone: timezone || 'UTC',
        emailDigest: emailDigest || 'daily',
      },
    },
    { new: true }
  );

  if (!user) {
    throw new NotFoundError('User not found');
  }

  logger.info(`User preferences updated: ${user.email}`);

  const preferences = (user as any).preferences || {};

  res.json({
    success: true,
    data: {
      theme: preferences.theme || 'light',
      language: preferences.language || 'en',
      timezone: preferences.timezone || 'UTC',
      emailDigest: preferences.emailDigest || 'daily',
      notifications: {
        email: preferences.notifications?.email !== false,
        push: preferences.notifications?.push !== false,
        inApp: preferences.notifications?.inApp !== false,
      },
    },
  });
});

/**
 * API Keys: List keys
 */
export const listApiKeys = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id).select('apiKeys email');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const keys = (user.apiKeys || []).filter((k: any) => !k.revokedAt).map((k: any) => ({
    id: k._id,
    label: k.label,
    createdAt: k.createdAt,
    lastUsedAt: k.lastUsedAt || null,
    // Do not expose full token in list
    maskedToken: k.token ? `${k.token.slice(0, 6)}...${k.token.slice(-4)}` : '',
  }));

  res.json({ success: true, data: keys });
});

/**
 * API Keys: Create key
 */
export const createApiKey = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { label } = req.body;
  if (!label || typeof label !== 'string' || !label.trim()) {
    throw new ValidationError('Key label is required');
  }

  const token = `ak_${crypto.randomBytes(24).toString('hex')}`;

  const user = await User.findByIdAndUpdate(
    req.user!._id,
    { $push: { apiKeys: { token, label: label.trim(), createdAt: new Date() } } },
    { new: true }
  ).select('apiKeys');

  const created = (user!.apiKeys || []).slice(-1)[0];

  res.json({
    success: true,
    data: {
      id: created._id,
      label: created.label,
      token, // Return full token only at creation time
      createdAt: created.createdAt,
    },
  });
});

/**
 * API Keys: Revoke key
 */
export const revokeApiKey = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!id) throw new ValidationError('Key id is required');

  const user = await User.findById(req.user!._id);
  if (!user) throw new NotFoundError('User not found');

  const key = (user.apiKeys || []).find((k: any) => String(k._id) === id);
  if (!key) throw new NotFoundError('API key not found');

  key.revokedAt = new Date();
  await user.save();

  res.json({ success: true, data: { id } });
});

/**
 * Get user activity
 */
export const getUserActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20 } = req.query;
  const Activity = require('../models/Activity').default;

  const activities = await Activity.find({ user: req.user!._id })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: -1 });

  const total = await Activity.countDocuments({ user: req.user!._id });

  res.json({
    success: true,
    data: activities,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

/**
 * Get user sessions
 */
export const getUserSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const Session = require('../models/Session').default;

  const sessions = await Session.find({ userId: req.user!._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: sessions.map((session: any) => ({
      id: session._id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isCurrent: session._id.toString() === req.sessionId?.toString(),
    })),
  });
});

/**
 * Logout from session
 */
export const logoutFromSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const Session = require('../models/Session').default;

  const session = await Session.findOne({
    _id: sessionId,
    userId: req.user!._id,
  });

  if (!session) {
    throw new NotFoundError('Session not found');
  }

  await Session.updateOne({ _id: sessionId }, { $set: { deletedAt: new Date() } });

  logger.info(`User logged out from session: ${req.user!.email}`);

  res.json({
    success: true,
    message: 'Logged out from session',
  });
});

/**
 * Logout from all sessions
 */
export const logoutFromAllSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const Session = require('../models/Session').default;

  await Session.updateMany({ userId: req.user!._id }, { $set: { deletedAt: new Date() } });

  logger.info(`User logged out from all sessions: ${req.user!.email}`);

  res.json({
    success: true,
    message: 'Logged out from all sessions',
  });
});

/**
 * Deactivate account
 */
export const deactivateAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { password } = req.body;

  // Verify password
  const user = await User.findById(req.user!._id).select('+password');
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isPasswordValid = await PasswordUtil.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AuthorizationError('Invalid password');
  }

  // Deactivate user
  (user as any).isActive = false;
  await user.save();

  // Delete all sessions
  const Session = require('../models/Session').default;
  await Session.updateMany({ userId: req.user!._id }, { $set: { deletedAt: new Date() } });

  logger.info(`User account deactivated: ${user.email}`);

  res.json({
    success: true,
    message: 'Account deactivated',
  });
});

/**
 * Get user statistics
 */
export const getUserStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { Task } = require('../models/Task');
  const { Project } = require('../models/Project');
  const organizationId = req.organizationId;

  const myTasks = await Task.countDocuments({
    assignee: req.user!._id,
    organization: organizationId,
    status: { $ne: 'done' },
    deletedAt: null,
  });

  const completedTasks = await Task.countDocuments({
    assignee: req.user!._id,
    organization: organizationId,
    status: 'done',
    deletedAt: null,
  });

  const myProjects = await Project.countDocuments({
    owner: req.user!._id,
    organization: organizationId,
    deletedAt: null,
  });

  const overdueTasks = await Task.countDocuments({
    assignee: req.user!._id,
    organization: organizationId,
    dueDate: { $lt: new Date() },
    status: { $ne: 'done' },
    deletedAt: null,
  });

  res.json({
    success: true,
    data: {
      myTasks,
      completedTasks,
      myProjects,
      overdueTasks,
    },
  });
});
