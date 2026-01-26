"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const env_1 = __importDefault(require("./env"));
const logger_1 = __importDefault(require("../utils/logger"));
class RedisClient {
    static instance;
    client = null;
    isConnected = false;
    isEnabled = false;
    connectionAttempts = 0;
    maxConnectionAttempts = 3;
    constructor() {
        try {
            this.client = (0, redis_1.createClient)({
                url: env_1.default.redis.url,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > this.maxConnectionAttempts) {
                            logger_1.default.warn('⚠️  Redis max connection attempts reached. Running without Redis.');
                            this.isEnabled = false;
                            return false;
                        }
                        return Math.min(retries * 100, 3000);
                    },
                },
            });
            this.client.on('error', (_error) => {
                if (this.connectionAttempts === 0) {
                    logger_1.default.warn('⚠️  Redis connection failed. Server will run without Redis caching.');
                }
                this.connectionAttempts++;
            });
            this.client.on('connect', () => {
                logger_1.default.info('✅ Redis connected successfully');
                this.isConnected = true;
                this.isEnabled = true;
                this.connectionAttempts = 0;
            });
            this.client.on('disconnect', () => {
                logger_1.default.warn('Redis disconnected');
                this.isConnected = false;
            });
        }
        catch (error) {
            logger_1.default.warn('⚠️  Redis initialization failed. Running without Redis.');
            this.isEnabled = false;
        }
    }
    static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }
    async connect() {
        if (!this.client) {
            logger_1.default.warn('⚠️  Redis client not initialized. Skipping connection.');
            return;
        }
        if (!this.isConnected) {
            try {
                await this.client.connect();
                this.isEnabled = true;
            }
            catch (error) {
                logger_1.default.warn('⚠️  Redis connection failed. Server will continue without Redis.');
                this.isEnabled = false;
            }
        }
    }
    async disconnect() {
        if (this.client && this.isConnected) {
            try {
                await this.client.disconnect();
                logger_1.default.info('Redis connection closed');
            }
            catch (error) {
                logger_1.default.warn('Error closing Redis connection:', error);
            }
        }
    }
    getIsEnabled() {
        return this.isEnabled && this.isConnected;
    }
    // Session management
    async setSession(sessionId, data, expirySeconds = 604800) {
        if (!this.getIsEnabled() || !this.client)
            return;
        try {
            await this.client.setEx(`session:${sessionId}`, expirySeconds, JSON.stringify(data));
        }
        catch (error) {
            logger_1.default.warn('Redis setSession failed:', error);
        }
    }
    async getSession(sessionId) {
        if (!this.getIsEnabled() || !this.client)
            return null;
        try {
            const data = await this.client.get(`session:${sessionId}`);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            logger_1.default.warn('Redis getSession failed:', error);
            return null;
        }
    }
    async deleteSession(sessionId) {
        if (!this.getIsEnabled() || !this.client)
            return;
        try {
            await this.client.del(`session:${sessionId}`);
        }
        catch (error) {
            logger_1.default.warn('Redis deleteSession failed:', error);
        }
    }
    // Cache management
    async setCache(key, data, expirySeconds = 3600) {
        if (!this.getIsEnabled() || !this.client)
            return;
        try {
            await this.client.setEx(`cache:${key}`, expirySeconds, JSON.stringify(data));
        }
        catch (error) {
            logger_1.default.warn('Redis setCache failed:', error);
        }
    }
    async getCache(key) {
        if (!this.getIsEnabled() || !this.client)
            return null;
        try {
            const data = await this.client.get(`cache:${key}`);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            logger_1.default.warn('Redis getCache failed:', error);
            return null;
        }
    }
    async deleteCache(key) {
        if (!this.getIsEnabled() || !this.client)
            return;
        try {
            await this.client.del(`cache:${key}`);
        }
        catch (error) {
            logger_1.default.warn('Redis deleteCache failed:', error);
        }
    }
    async deleteCachePattern(pattern) {
        if (!this.getIsEnabled() || !this.client)
            return;
        try {
            const keys = await this.client.keys(`cache:${pattern}`);
            if (keys.length > 0) {
                await this.client.del(keys);
            }
        }
        catch (error) {
            logger_1.default.warn('Redis deleteCachePattern failed:', error);
        }
    }
    // Raw Redis operations for auth/sessions
    async setEx(key, seconds, value) {
        if (!this.getIsEnabled() || !this.client)
            return;
        try {
            await this.client.setEx(key, seconds, value);
        }
        catch (error) {
            logger_1.default.warn('Redis setEx failed:', error);
        }
    }
    async get(key) {
        if (!this.getIsEnabled() || !this.client)
            return null;
        try {
            return await this.client.get(key);
        }
        catch (error) {
            logger_1.default.warn('Redis get failed:', error);
            return null;
        }
    }
    async getEx(key) {
        if (!this.getIsEnabled() || !this.client)
            return null;
        try {
            return await this.client.get(key);
        }
        catch (error) {
            logger_1.default.warn('Redis getEx failed:', error);
            return null;
        }
    }
    async del(keys) {
        if (!this.getIsEnabled() || !this.client)
            return 0;
        try {
            if (typeof keys === 'string') {
                return await this.client.del(keys);
            }
            return await this.client.del(keys);
        }
        catch (error) {
            logger_1.default.warn('Redis del failed:', error);
            return 0;
        }
    }
    async exists(key) {
        if (!this.getIsEnabled() || !this.client)
            return 0;
        try {
            return await this.client.exists(key);
        }
        catch (error) {
            logger_1.default.warn('Redis exists failed:', error);
            return 0;
        }
    }
    // Rate limiting
    async incrementRateLimit(key, windowMs) {
        if (!this.getIsEnabled() || !this.client)
            return 0;
        try {
            const rateLimitKey = `ratelimit:${key}`;
            const current = await this.client.incr(rateLimitKey);
            if (current === 1) {
                await this.client.expire(rateLimitKey, Math.ceil(windowMs / 1000));
            }
            return current;
        }
        catch (error) {
            logger_1.default.warn('Redis incrementRateLimit failed:', error);
            return 0;
        }
    }
    // Refresh token storage
    async setRefreshToken(userId, tokenId, expirySeconds) {
        if (!this.getIsEnabled() || !this.client)
            return;
        try {
            await this.client.setEx(`refresh:${userId}:${tokenId}`, expirySeconds, 'valid');
        }
        catch (error) {
            logger_1.default.warn('Redis setRefreshToken failed:', error);
        }
    }
    async validateRefreshToken(userId, tokenId) {
        if (!this.getIsEnabled() || !this.client)
            return false;
        try {
            const exists = await this.client.exists(`refresh:${userId}:${tokenId}`);
            return exists === 1;
        }
        catch (error) {
            logger_1.default.warn('Redis validateRefreshToken failed:', error);
            return false;
        }
    }
    async revokeRefreshToken(userId, tokenId) {
        if (!this.getIsEnabled() || !this.client)
            return;
        try {
            await this.client.del(`refresh:${userId}:${tokenId}`);
        }
        catch (error) {
            logger_1.default.warn('Redis revokeRefreshToken failed:', error);
        }
    }
    async revokeAllRefreshTokens(userId) {
        if (!this.getIsEnabled() || !this.client)
            return;
        try {
            const keys = await this.client.keys(`refresh:${userId}:*`);
            if (keys.length > 0) {
                await this.client.del(keys);
            }
        }
        catch (error) {
            logger_1.default.warn('Redis revokeAllRefreshTokens failed:', error);
        }
    }
}
exports.default = RedisClient.getInstance();
//# sourceMappingURL=redis.js.map