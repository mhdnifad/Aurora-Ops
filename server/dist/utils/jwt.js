"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTUtil = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
const uuid_1 = require("uuid");
class JWTUtil {
    /**
     * Generate access token (short-lived)
     */
    static generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.default.jwt.secret, {
            expiresIn: env_1.default.jwt.expiresIn,
            issuer: 'aurora-ops',
            audience: 'aurora-ops-api',
        });
    }
    /**
     * Generate refresh token (long-lived)
     */
    static generateRefreshToken(payload) {
        const tokenId = (0, uuid_1.v4)();
        const token = jsonwebtoken_1.default.sign({ ...payload, tokenId }, env_1.default.jwt.refreshSecret, {
            expiresIn: env_1.default.jwt.refreshExpiresIn,
            issuer: 'aurora-ops',
            audience: 'aurora-ops-api',
        });
        return { token, tokenId };
    }
    /**
     * Verify access token
     */
    static verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.default.jwt.secret, {
                issuer: 'aurora-ops',
                audience: 'aurora-ops-api',
            });
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error('Access token expired');
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error('Invalid access token');
            }
            throw error;
        }
    }
    /**
     * Verify refresh token
     */
    static verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.default.jwt.refreshSecret, {
                issuer: 'aurora-ops',
                audience: 'aurora-ops-api',
            });
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error('Refresh token expired');
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error('Invalid refresh token');
            }
            throw error;
        }
    }
    /**
     * Decode token without verification (for debugging)
     */
    static decodeToken(token) {
        return jsonwebtoken_1.default.decode(token);
    }
    /**
     * Get token expiration time
     */
    static getTokenExpiration(token) {
        const decoded = jsonwebtoken_1.default.decode(token);
        if (decoded && decoded.exp) {
            return new Date(decoded.exp * 1000);
        }
        return null;
    }
}
exports.JWTUtil = JWTUtil;
exports.default = JWTUtil;
//# sourceMappingURL=jwt.js.map