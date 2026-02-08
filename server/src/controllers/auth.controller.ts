import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import User from '../models/User';
import Session from '../models/Session';
import { JWTUtil } from '../utils/jwt';
import { PasswordUtil } from '../utils/password';
import { asyncHandler } from '../utils/helpers';
import { AuthenticationError, ValidationError, ConflictError } from '../utils/errors';
import redis from '../config/redis';
import logger from '../utils/logger';
import emailService from '../services/email.service';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validations/auth.validation';
import { generateToken, hashToken } from '../utils/token';
import config from '../config/env';

const getDurationSeconds = (value: string, fallbackSeconds: number): number => {
  if (!value) {
    return fallbackSeconds;
  }
  const match = value.trim().match(/^(\d+)([smhd])$/i);
  if (!match) {
    return fallbackSeconds;
  }
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === 's') return amount;
  if (unit === 'm') return amount * 60;
  if (unit === 'h') return amount * 60 * 60;
  if (unit === 'd') return amount * 24 * 60 * 60;
  return fallbackSeconds;
};

const REFRESH_TTL_SECONDS = getDurationSeconds(config.jwt.refreshExpiresIn, 7 * 24 * 60 * 60);
const EMAIL_VERIFY_TTL_SECONDS = 24 * 60 * 60;

/**
 * Register a new user
 */
export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ValidationError('Invalid registration data');
  }

  const { firstName, lastName, email, password } = validation.data;

  const userAgent = req.get('user-agent') || 'Unknown';
  const ip =
    (Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()) ||
    req.ip ||
    '0.0.0.0';

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase(), deletedAt: null });
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  // Hash password
  const hashedPassword = await PasswordUtil.hash(password);

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password: hashedPassword,
    isEmailVerified: false,
  });

  // Generate tokens
  const accessToken = JWTUtil.generateAccessToken({
    userId: user._id.toString(),
    email: user.email,
  });

  const refreshTokenPayload = JWTUtil.generateRefreshToken({
    userId: user._id.toString(),
    email: user.email,
  });

  const refreshToken = refreshTokenPayload.token;
  const refreshTokenHash = hashToken(refreshToken);

  // Store refresh token in Redis
  await redis.setRefreshToken(user._id.toString(), refreshTokenPayload.tokenId, REFRESH_TTL_SECONDS);

  // Create session
  await Session.create({
    userId: user._id,
    tokenId: refreshTokenPayload.tokenId,
    refreshToken: refreshTokenHash,
    deviceInfo: {
      userAgent,
      ip,
    },
    expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
  });

  logger.info(`User registered: ${user.email}`);

  // Send welcome + verification email (async, don't wait)
  emailService.sendWelcomeEmail(user.email, user.firstName).catch(err => {
    logger.error('Failed to send welcome email:', err);
  });

  if (emailService.isEnabled()) {
    const verificationToken = generateToken(32);
    await redis.setEx(`email_token:${verificationToken}`, EMAIL_VERIFY_TTL_SECONDS, user._id.toString());
    emailService.sendVerificationEmail(user.email, user.firstName, verificationToken).catch(err => {
      logger.error('Failed to send verification email:', err);
    });
  }

  // Return sanitized user and tokens
  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        systemRole: user.systemRole,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
});

/**
 * Login user
 */
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Validate request
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ValidationError('Invalid login data');
  }

  const { email, password } = validation.data;

  const userAgent = req.get('user-agent') || 'Unknown';
  const ip =
    (Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()) ||
    req.ip ||
    '0.0.0.0';

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase(), deletedAt: null }).select('+password');
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Check if account is active
  if (!user.isActive) {
    throw new AuthenticationError('Account has been deactivated');
  }

  // Compare passwords
  const isPasswordValid = await PasswordUtil.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Generate tokens
  const accessToken = JWTUtil.generateAccessToken({
    userId: user._id.toString(),
    email: user.email,
  });

  const refreshTokenPayload = JWTUtil.generateRefreshToken({
    userId: user._id.toString(),
    email: user.email,
  });

  const refreshToken = refreshTokenPayload.token;
  const refreshTokenHash = hashToken(refreshToken);

  // Store refresh token in Redis
  await redis.setRefreshToken(user._id.toString(), refreshTokenPayload.tokenId, REFRESH_TTL_SECONDS);

  // Create session
  await Session.create({
    userId: user._id,
    tokenId: refreshTokenPayload.tokenId,
    refreshToken: refreshTokenHash,
    deviceInfo: {
      userAgent,
      ip,
    },
    expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
  });

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  logger.info(`User logged in: ${user.email}`);

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        systemRole: user.systemRole,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
});

/**
 * Refresh access token
 */
export const refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new AuthenticationError('Refresh token is required');
  }

  // Verify refresh token JWT signature
  const decoded = JWTUtil.verifyRefreshToken(token);

  // Get user (check user exists before Redis check)
  const user = await User.findOne({ _id: decoded.userId, deletedAt: null });
  if (!user || !user.isActive) {
    throw new AuthenticationError('User not found or inactive');
  }

  const tokenHash = hashToken(token);
  const isRedisValid = await redis.validateRefreshToken(decoded.userId, decoded.tokenId);
  const session = await Session.findOne({
    userId: decoded.userId,
    tokenId: decoded.tokenId,
    isActive: true,
    deletedAt: null,
  });

  if (!isRedisValid && !session) {
    throw new AuthenticationError('Refresh token has been revoked');
  }

  if (session && session.refreshToken !== tokenHash) {
    throw new AuthenticationError('Refresh token is invalid');
  }

  // Generate new access + refresh token (rotation)
  const accessToken = JWTUtil.generateAccessToken({
    userId: user._id.toString(),
    email: user.email,
  });

  const newRefresh = JWTUtil.generateRefreshToken({
    userId: user._id.toString(),
    email: user.email,
  });

  const newRefreshHash = hashToken(newRefresh.token);

  if (session) {
    session.tokenId = newRefresh.tokenId;
    session.refreshToken = newRefreshHash;
    session.lastActivityAt = new Date();
    session.expiresAt = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);
    await session.save();
  }

  await redis.revokeRefreshToken(decoded.userId, decoded.tokenId);
  await redis.setRefreshToken(user._id.toString(), newRefresh.tokenId, REFRESH_TTL_SECONDS);

  logger.info(`Token refreshed for user: ${user.email}`);

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken: newRefresh.token,
    },
  });
});

/**
 * Logout user
 */
export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const token = (req.body?.refreshToken as string | undefined) || '';

  if (token) {
    try {
      const decoded = JWTUtil.verifyRefreshToken(token);
      await redis.revokeRefreshToken(decoded.userId, decoded.tokenId);
      await Session.updateMany(
        { userId: decoded.userId, tokenId: decoded.tokenId },
        { isActive: false }
      );
    } catch {
      // Ignore invalid refresh token on logout
    }
  }

  // Delete all sessions for this user
  await Session.updateMany(
    { userId, deletedAt: null },
    { $set: { deletedAt: new Date(), isActive: false } }
  );

  logger.info(`User logged out: ${req.user!.email}`);

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * Get current user
 */
export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findOne({ _id: req.user!._id, deletedAt: null });

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt,
        systemRole: user.systemRole,
      },
    },
  });
});

/**
 * Forgot password - send reset email
 */
export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.body;

  // Validate request
  const validation = forgotPasswordSchema.safeParse({ email });
  if (!validation.success) {
    throw new ValidationError('Invalid email');
  }

  // Find user
  const user = await User.findOne({ email: email.toLowerCase(), deletedAt: null });
  if (!user) {
    // Don't reveal if email exists
    res.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent',
    });
    return;
  }

  // Generate reset token
  const resetToken = PasswordUtil.generateRandom(32);
  const resetTokenHash = await PasswordUtil.hash(resetToken);

  // Store reset token in Redis (expires in 1 hour)
  await redis.setEx(
    `reset_token:${user._id.toString()}`,
    3600,
    resetTokenHash
  );

  // Send email with reset token (if email service is configured)
  try {
    if (emailService.isEnabled()) {
      await emailService.sendPasswordResetEmail(user.email, user.firstName || user.email, resetToken);
    } else {
      logger.warn('Email service not configured; skipping password reset email');
    }
  } catch (e) {
    logger.error('Error sending password reset email', e);
  }
  logger.info(`Password reset token generated for user: ${user.email}`);

  res.json({
    success: true,
    message: 'If an account exists with that email, a password reset link has been sent',
    // In development, return the token for testing
    ...(process.env.NODE_ENV === 'development' && { resetToken }),
  });
});

/**
 * Reset password
 */
export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId, resetToken, password, passwordConfirm } = req.body;

  // Validate request
  const validation = resetPasswordSchema.safeParse({ password, passwordConfirm });
  if (!validation.success) {
    throw new ValidationError('Invalid password');
  }

  // Get reset token from Redis
  const storedTokenHash = await redis.get(`reset_token:${userId}`);
  if (!storedTokenHash) {
    throw new AuthenticationError('Password reset token has expired');
  }

  // Verify reset token
  const isTokenValid = await PasswordUtil.compare(resetToken, storedTokenHash);
  if (!isTokenValid) {
    throw new AuthenticationError('Invalid password reset token');
  }

  // Find user
  const user = await User.findOne({ _id: userId, deletedAt: null });
  if (!user) {
    throw new AuthenticationError('User not found');
  }

  // Hash new password
  const hashedPassword = await PasswordUtil.hash(password);

  // Update user password
  user.password = hashedPassword;
  await user.save();

  // Delete reset token
  await redis.del(`reset_token:${userId}`);

  logger.info(`Password reset for user: ${user.email}`);

  res.json({
    success: true,
    message: 'Password reset successfully',
  });
});

/**
 * Change password (for authenticated users)
 */
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;

  // Validate request
  if (newPassword !== newPasswordConfirm) {
    throw new ValidationError('Passwords do not match');
  }

  if (newPassword.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long');
  }

  // Get user with password field
  const user = await User.findOne({ _id: req.user!._id, deletedAt: null }).select('+password');
  if (!user) {
    throw new AuthenticationError('User not found');
  }

  // Verify current password
  const isCurrentPasswordValid = await PasswordUtil.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new AuthenticationError('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await PasswordUtil.hash(newPassword);

  // Update password
  user.password = hashedPassword;
  await user.save();

  logger.info(`Password changed for user: ${user.email}`);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

/**
 * Verify email token (for email verification feature)
 */
export const verifyEmail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token } = req.body;

  if (!token) {
    throw new ValidationError('Verification token is required');
  }

  // Get verification token from Redis
  const userId = await redis.get(`email_token:${token}`);
  if (!userId) {
    throw new AuthenticationError('Email verification token has expired');
  }

  // Update user
  const user = await User.findOneAndUpdate(
    { _id: userId, deletedAt: null },
    { isEmailVerified: true },
    { new: true }
  );

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  // Delete verification token
  await redis.del(`email_token:${token}`);

  logger.info(`Email verified for user: ${user.email}`);

  res.json({
    success: true,
    message: 'Email verified successfully',
  });
});
