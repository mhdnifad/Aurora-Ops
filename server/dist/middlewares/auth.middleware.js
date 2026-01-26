"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = exports.authMiddleware = exports.optionalAuthenticate = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
const User_1 = __importDefault(require("../models/User"));
/**
 * Authenticate user from JWT token
 */
const authenticate = async (req, _res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.AuthenticationError('No token provided');
        }
        const token = authHeader.substring(7);
        // Verify token
        const decoded = jwt_1.JWTUtil.verifyAccessToken(token);
        // Check if user exists
        const user = await User_1.default.findById(decoded.userId);
        if (!user || user.deletedAt) {
            throw new errors_1.AuthenticationError('User not found');
        }
        // Attach user to request
        req.user = {
            userId: decoded.userId,
            _id: decoded.userId, // Alias for compatibility
            email: decoded.email,
            organizationId: decoded.organizationId,
        };
        next();
    }
    catch (error) {
        if (error instanceof errors_1.AuthenticationError) {
            next(error);
        }
        else {
            next(new errors_1.AuthenticationError('Invalid or expired token'));
        }
    }
};
exports.authenticate = authenticate;
/**
 * Optional authentication (doesn't throw error if no token)
 */
const optionalAuthenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        const decoded = jwt_1.JWTUtil.verifyAccessToken(token);
        const user = await User_1.default.findById(decoded.userId);
        if (user && !user.deletedAt) {
            req.user = {
                userId: decoded.userId,
                _id: decoded.userId, // Alias for compatibility
                email: decoded.email,
                organizationId: decoded.organizationId,
            };
        }
        next();
    }
    catch (error) {
        // Continue without authentication
        next();
    }
};
exports.optionalAuthenticate = optionalAuthenticate;
// Backwards-compatible aliases
exports.authMiddleware = exports.authenticate;
exports.authenticateToken = exports.authenticate;
//# sourceMappingURL=auth.middleware.js.map