"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.deactivateAccount = exports.logoutFromAllSessions = exports.logoutFromSession = exports.getUserSessions = exports.getUserActivity = exports.revokeApiKey = exports.createApiKey = exports.listApiKeys = exports.updateUserPreferences = exports.getUserPreferences = exports.uploadAvatar = exports.updateUserProfile = exports.getUserProfile = exports.removeAvatar = void 0;
const User_1 = __importDefault(require("../models/User"));
const helpers_1 = require("../utils/helpers");
const cloudinary_service_1 = __importDefault(require("../services/cloudinary.service"));
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const password_1 = require("../utils/password");
const crypto_1 = __importDefault(require("crypto"));
/**
 * Remove user avatar
 */
exports.removeAvatar = (0, helpers_1.asyncHandler)(async (req, res) => {
    const user = await User_1.default.findByIdAndUpdate(req.user._id, { avatar: null }, { new: true });
    if (!user) {
        throw new errors_1.NotFoundError('User not found');
    }
    logger_1.default.info(`Avatar removed for user: ${user.email}`);
    res.json({
        success: true,
        data: { avatar: null },
    });
});
/**
 * Get user profile
 */
exports.getUserProfile = (0, helpers_1.asyncHandler)(async (req, res) => {
    const user = await User_1.default.findById(req.user._id);
    if (!user) {
        throw new errors_1.NotFoundError('User not found');
    }
    res.json({
        success: true,
        data: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar,
            bio: user?.bio,
            phone: user?.phone,
            isActive: user?.isActive,
            createdAt: user.createdAt,
        },
    });
});
/**
 * Update user profile
 */
exports.updateUserProfile = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { firstName, lastName, bio, phone } = req.body;
    const user = await User_1.default.findByIdAndUpdate(req.user._id, {
        firstName,
        lastName,
        bio,
        phone,
    }, { new: true, runValidators: true });
    if (!user) {
        throw new errors_1.NotFoundError('User not found');
    }
    logger_1.default.info(`User profile updated: ${user.email}`);
    res.json({
        success: true,
        data: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar,
            bio: user?.bio,
            phone: user?.phone,
        },
    });
});
/**
 * Upload user avatar
 */
exports.uploadAvatar = (0, helpers_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw new errors_1.ValidationError('No file provided');
    }
    // Validate avatar file type (allow common image formats)
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedImageTypes.includes(req.file.mimetype)) {
        throw new errors_1.ValidationError('Unsupported file type. Allowed: JPG, PNG, WEBP, GIF');
    }
    // Prefer Cloudinary uploads when configured, fallback to base64 data URL
    let uploadedUrl;
    if (cloudinary_service_1.default.isEnabled()) {
        uploadedUrl = await cloudinary_service_1.default.uploadAvatar(req.file.buffer, req.user._id.toString());
    }
    else {
        // Fallback: store as base64 data URL (suitable for development)
        const base64Data = req.file.buffer.toString('base64');
        uploadedUrl = `data:${req.file.mimetype};base64,${base64Data}`;
        logger_1.default.info('Avatar stored as base64 (Cloudinary not configured)');
    }
    const user = await User_1.default.findByIdAndUpdate(req.user._id, {
        avatar: uploadedUrl,
    }, { new: true });
    if (!user) {
        throw new errors_1.NotFoundError('User not found');
    }
    logger_1.default.info(`Avatar uploaded for user: ${user.email}`);
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
exports.getUserPreferences = (0, helpers_1.asyncHandler)(async (req, res) => {
    const user = await User_1.default.findById(req.user._id);
    if (!user) {
        throw new errors_1.NotFoundError('User not found');
    }
    const preferences = user.preferences || {};
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
exports.updateUserPreferences = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { theme, notifications, language, timezone, emailDigest } = req.body;
    // Store preferences in user document
    const user = await User_1.default.findByIdAndUpdate(req.user._id, {
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
    }, { new: true });
    if (!user) {
        throw new errors_1.NotFoundError('User not found');
    }
    logger_1.default.info(`User preferences updated: ${user.email}`);
    const preferences = user.preferences || {};
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
exports.listApiKeys = (0, helpers_1.asyncHandler)(async (req, res) => {
    const user = await User_1.default.findById(req.user._id).select('apiKeys email');
    if (!user) {
        throw new errors_1.NotFoundError('User not found');
    }
    const keys = (user.apiKeys || []).filter((k) => !k.revokedAt).map((k) => ({
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
exports.createApiKey = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { label } = req.body;
    if (!label || typeof label !== 'string' || !label.trim()) {
        throw new errors_1.ValidationError('Key label is required');
    }
    const token = `ak_${crypto_1.default.randomBytes(24).toString('hex')}`;
    const user = await User_1.default.findByIdAndUpdate(req.user._id, { $push: { apiKeys: { token, label: label.trim(), createdAt: new Date() } } }, { new: true }).select('apiKeys');
    const created = (user.apiKeys || []).slice(-1)[0];
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
exports.revokeApiKey = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new errors_1.ValidationError('Key id is required');
    const user = await User_1.default.findById(req.user._id);
    if (!user)
        throw new errors_1.NotFoundError('User not found');
    const key = (user.apiKeys || []).find((k) => String(k._id) === id);
    if (!key)
        throw new errors_1.NotFoundError('API key not found');
    key.revokedAt = new Date();
    await user.save();
    res.json({ success: true, data: { id } });
});
/**
 * Get user activity
 */
exports.getUserActivity = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const Activity = require('../models/Activity').default;
    const activities = await Activity.find({ user: req.user._id })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .sort({ createdAt: -1 });
    const total = await Activity.countDocuments({ user: req.user._id });
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
exports.getUserSessions = (0, helpers_1.asyncHandler)(async (req, res) => {
    const Session = require('../models/Session').default;
    const sessions = await Session.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({
        success: true,
        data: sessions.map((session) => ({
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
exports.logoutFromSession = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { sessionId } = req.params;
    const Session = require('../models/Session').default;
    const session = await Session.findOne({
        _id: sessionId,
        userId: req.user._id,
    });
    if (!session) {
        throw new errors_1.NotFoundError('Session not found');
    }
    await Session.updateOne({ _id: sessionId }, { $set: { deletedAt: new Date() } });
    logger_1.default.info(`User logged out from session: ${req.user.email}`);
    res.json({
        success: true,
        message: 'Logged out from session',
    });
});
/**
 * Logout from all sessions
 */
exports.logoutFromAllSessions = (0, helpers_1.asyncHandler)(async (req, res) => {
    const Session = require('../models/Session').default;
    await Session.updateMany({ userId: req.user._id }, { $set: { deletedAt: new Date() } });
    logger_1.default.info(`User logged out from all sessions: ${req.user.email}`);
    res.json({
        success: true,
        message: 'Logged out from all sessions',
    });
});
/**
 * Deactivate account
 */
exports.deactivateAccount = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { password } = req.body;
    // Verify password
    const user = await User_1.default.findById(req.user._id).select('+password');
    if (!user) {
        throw new errors_1.NotFoundError('User not found');
    }
    const isPasswordValid = await password_1.PasswordUtil.compare(password, user.password);
    if (!isPasswordValid) {
        throw new errors_1.AuthorizationError('Invalid password');
    }
    // Deactivate user
    user.isActive = false;
    await user.save();
    // Delete all sessions
    const Session = require('../models/Session').default;
    await Session.updateMany({ userId: req.user._id }, { $set: { deletedAt: new Date() } });
    logger_1.default.info(`User account deactivated: ${user.email}`);
    res.json({
        success: true,
        message: 'Account deactivated',
    });
});
/**
 * Get user statistics
 */
exports.getUserStats = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { Task } = require('../models/Task');
    const { Project } = require('../models/Project');
    const organizationId = req.organizationId;
    const myTasks = await Task.countDocuments({
        assignee: req.user._id,
        organization: organizationId,
        status: { $ne: 'done' },
        deletedAt: null,
    });
    const completedTasks = await Task.countDocuments({
        assignee: req.user._id,
        organization: organizationId,
        status: 'done',
        deletedAt: null,
    });
    const myProjects = await Project.countDocuments({
        owner: req.user._id,
        organization: organizationId,
        deletedAt: null,
    });
    const overdueTasks = await Task.countDocuments({
        assignee: req.user._id,
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
//# sourceMappingURL=user.controller.js.map