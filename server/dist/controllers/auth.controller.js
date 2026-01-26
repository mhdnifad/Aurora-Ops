"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.getCurrentUser = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const Session_1 = __importDefault(require("../models/Session"));
const jwt_1 = require("../utils/jwt");
const password_1 = require("../utils/password");
const helpers_1 = require("../utils/helpers");
const errors_1 = require("../utils/errors");
const redis_1 = __importDefault(require("../config/redis"));
const logger_1 = __importDefault(require("../utils/logger"));
const email_service_1 = __importDefault(require("../services/email.service"));
const auth_validation_1 = require("../validations/auth.validation");
/**
 * Register a new user
 */
exports.register = (0, helpers_1.asyncHandler)(async (req, res) => {
    const validation = auth_validation_1.registerSchema.safeParse(req.body);
    if (!validation.success) {
        throw new errors_1.ValidationError('Invalid registration data');
    }
    const { firstName, lastName, email, password } = validation.data;
    const userAgent = req.get('user-agent') || 'Unknown';
    const ip = (Array.isArray(req.headers['x-forwarded-for'])
        ? req.headers['x-forwarded-for'][0]
        : req.headers['x-forwarded-for']?.split(',')[0]?.trim()) ||
        req.ip ||
        '0.0.0.0';
    // Check if user already exists
    const existingUser = await User_1.default.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new errors_1.ConflictError('Email already registered');
    }
    // Hash password
    const hashedPassword = await password_1.PasswordUtil.hash(password);
    // Create user
    const user = await User_1.default.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        isEmailVerified: false,
    });
    // Generate tokens
    const accessToken = jwt_1.JWTUtil.generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
    });
    const refreshTokenPayload = jwt_1.JWTUtil.generateRefreshToken({
        userId: user._id.toString(),
        email: user.email,
    });
    const refreshToken = typeof refreshTokenPayload === 'string' ? refreshTokenPayload : refreshTokenPayload.token;
    // Store refresh token in Redis
    await redis_1.default.setEx(`refresh_token:${user._id.toString()}`, 7 * 24 * 60 * 60, refreshToken);
    // Create session
    await Session_1.default.create({
        userId: user._id,
        refreshToken,
        deviceInfo: {
            userAgent,
            ip,
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    logger_1.default.info(`User registered: ${user.email}`);
    // Send welcome email (async, don't wait)
    email_service_1.default.sendWelcomeEmail(user.email, user.firstName).catch(err => {
        logger_1.default.error('Failed to send welcome email:', err);
    });
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
exports.login = (0, helpers_1.asyncHandler)(async (req, res) => {
    // Validate request
    const validation = auth_validation_1.loginSchema.safeParse(req.body);
    if (!validation.success) {
        throw new errors_1.ValidationError('Invalid login data');
    }
    const { email, password } = validation.data;
    const userAgent = req.get('user-agent') || 'Unknown';
    const ip = (Array.isArray(req.headers['x-forwarded-for'])
        ? req.headers['x-forwarded-for'][0]
        : req.headers['x-forwarded-for']?.split(',')[0]?.trim()) ||
        req.ip ||
        '0.0.0.0';
    // Find user by email
    const user = await User_1.default.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
        throw new errors_1.AuthenticationError('Invalid email or password');
    }
    // Check if account is active
    if (!user?.isActive) {
        throw new errors_1.AuthenticationError('Account has been deactivated');
    }
    // Compare passwords
    const isPasswordValid = await password_1.PasswordUtil.compare(password, user.password);
    if (!isPasswordValid) {
        throw new errors_1.AuthenticationError('Invalid email or password');
    }
    // Generate tokens
    const accessToken = jwt_1.JWTUtil.generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
    });
    const refreshTokenPayload = jwt_1.JWTUtil.generateRefreshToken({
        userId: user._id.toString(),
        email: user.email,
    });
    const refreshToken = typeof refreshTokenPayload === 'string' ? refreshTokenPayload : refreshTokenPayload.token;
    // Store refresh token in Redis
    await redis_1.default.setEx(`refresh_token:${user._id.toString()}`, 7 * 24 * 60 * 60, refreshToken);
    // Create session
    await Session_1.default.create({
        userId: user._id,
        refreshToken,
        deviceInfo: {
            userAgent,
            ip,
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    // Update last login
    user.lastLoginAt = new Date();
    await user.save();
    logger_1.default.info(`User logged in: ${user.email}`);
    res.json({
        success: true,
        data: {
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatar: user.avatar,
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
exports.refreshToken = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { refreshToken: token } = req.body;
    if (!token) {
        throw new errors_1.AuthenticationError('Refresh token is required');
    }
    // Verify refresh token
    const decoded = jwt_1.JWTUtil.verifyRefreshToken(token);
    // Check if token exists in Redis
    const storedToken = await redis_1.default.get(`refresh_token:${decoded.userId}`);
    if (!storedToken || storedToken !== token) {
        throw new errors_1.AuthenticationError('Invalid or expired refresh token');
    }
    // Get user
    const user = await User_1.default.findById(decoded.userId);
    if (!user || !user?.isActive) {
        throw new errors_1.AuthenticationError('User not found or inactive');
    }
    // Generate new access token
    const accessToken = jwt_1.JWTUtil.generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
    });
    logger_1.default.info(`Token refreshed for user: ${user.email}`);
    res.json({
        success: true,
        data: {
            accessToken,
        },
    });
});
/**
 * Logout user
 */
exports.logout = (0, helpers_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    // Delete refresh token from Redis
    await redis_1.default.del(`refresh_token:${userId}`);
    // Delete all sessions for this user
    await Session_1.default.deleteMany({ userId });
    logger_1.default.info(`User logged out: ${req.user.email}`);
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});
/**
 * Get current user
 */
exports.getCurrentUser = (0, helpers_1.asyncHandler)(async (req, res) => {
    const user = await User_1.default.findById(req.user._id);
    if (!user) {
        throw new errors_1.AuthenticationError('User not found');
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
                isActive: user?.isActive,
                createdAt: user.createdAt,
            },
        },
    });
});
/**
 * Forgot password - send reset email
 */
exports.forgotPassword = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    // Validate request
    const validation = auth_validation_1.forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
        throw new errors_1.ValidationError('Invalid email');
    }
    // Find user
    const user = await User_1.default.findOne({ email: email.toLowerCase() });
    if (!user) {
        // Don't reveal if email exists
        res.json({
            success: true,
            message: 'If an account exists with that email, a password reset link has been sent',
        });
        return;
    }
    // Generate reset token
    const resetToken = password_1.PasswordUtil.generateRandom(32);
    const resetTokenHash = await password_1.PasswordUtil.hash(resetToken);
    // Store reset token in Redis (expires in 1 hour)
    await redis_1.default.setEx(`reset_token:${user._id.toString()}`, 3600, resetTokenHash);
    // Send email with reset token (if email service is configured)
    try {
        if (email_service_1.default.isEnabled()) {
            await email_service_1.default.sendPasswordResetEmail(user.email, user.firstName || user.email, resetToken);
        }
        else {
            logger_1.default.warn('Email service not configured; skipping password reset email');
        }
    }
    catch (e) {
        logger_1.default.error('Error sending password reset email', e);
    }
    logger_1.default.info(`Password reset token generated for user: ${user.email}`);
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
exports.resetPassword = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { userId, resetToken, password, passwordConfirm } = req.body;
    // Validate request
    const validation = auth_validation_1.resetPasswordSchema.safeParse({ password, passwordConfirm });
    if (!validation.success) {
        throw new errors_1.ValidationError('Invalid password');
    }
    // Get reset token from Redis
    const storedTokenHash = await redis_1.default.get(`reset_token:${userId}`);
    if (!storedTokenHash) {
        throw new errors_1.AuthenticationError('Password reset token has expired');
    }
    // Verify reset token
    const isTokenValid = await password_1.PasswordUtil.compare(resetToken, storedTokenHash);
    if (!isTokenValid) {
        throw new errors_1.AuthenticationError('Invalid password reset token');
    }
    // Find user
    const user = await User_1.default.findById(userId);
    if (!user) {
        throw new errors_1.AuthenticationError('User not found');
    }
    // Hash new password
    const hashedPassword = await password_1.PasswordUtil.hash(password);
    // Update user password
    user.password = hashedPassword;
    await user.save();
    // Delete reset token
    await redis_1.default.del(`reset_token:${userId}`);
    logger_1.default.info(`Password reset for user: ${user.email}`);
    res.json({
        success: true,
        message: 'Password reset successfully',
    });
});
/**
 * Change password (for authenticated users)
 */
exports.changePassword = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    // Validate request
    if (newPassword !== newPasswordConfirm) {
        throw new errors_1.ValidationError('Passwords do not match');
    }
    if (newPassword.length < 8) {
        throw new errors_1.ValidationError('Password must be at least 8 characters long');
    }
    // Get user with password field
    const user = await User_1.default.findById(req.user._id).select('+password');
    if (!user) {
        throw new errors_1.AuthenticationError('User not found');
    }
    // Verify current password
    const isCurrentPasswordValid = await password_1.PasswordUtil.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        throw new errors_1.AuthenticationError('Current password is incorrect');
    }
    // Hash new password
    const hashedPassword = await password_1.PasswordUtil.hash(newPassword);
    // Update password
    user.password = hashedPassword;
    await user.save();
    logger_1.default.info(`Password changed for user: ${user.email}`);
    res.json({
        success: true,
        message: 'Password changed successfully',
    });
});
/**
 * Verify email token (for email verification feature)
 */
exports.verifyEmail = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { token } = req.body;
    if (!token) {
        throw new errors_1.ValidationError('Verification token is required');
    }
    // Get verification token from Redis
    const userId = await redis_1.default.get(`email_token:${token}`);
    if (!userId) {
        throw new errors_1.AuthenticationError('Email verification token has expired');
    }
    // Update user
    const user = await User_1.default.findByIdAndUpdate(userId, { emailVerified: true }, { new: true });
    if (!user) {
        throw new errors_1.AuthenticationError('User not found');
    }
    // Delete verification token
    await redis_1.default.del(`email_token:${token}`);
    logger_1.default.info(`Email verified for user: ${user.email}`);
    res.json({
        success: true,
        message: 'Email verified successfully',
    });
});
//# sourceMappingURL=auth.controller.js.map