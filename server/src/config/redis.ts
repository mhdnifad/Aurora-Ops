import { createClient } from 'redis';
import config from './env';
import logger from '../utils/logger';

class RedisClient {
  private static instance: RedisClient;
  public client: ReturnType<typeof createClient> | null = null;
  private isConnected: boolean = false;
  private isEnabled: boolean = false;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 3;

  private constructor() {
    try {
      this.client = createClient({
        url: config.redis.url,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > this.maxConnectionAttempts) {
              logger.warn('⚠️  Redis max connection attempts reached. Running without Redis.');
              this.isEnabled = false;
              return false;
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on('error', () => {
        if (this.connectionAttempts === 0) {
          logger.warn('⚠️  Redis connection failed. Server will run without Redis caching.');
        }
        this.connectionAttempts++;
      });

      this.client.on('connect', () => {
        logger.info('✅ Redis connected successfully');
        this.isConnected = true;
        this.isEnabled = true;
        this.connectionAttempts = 0;
      });

      this.client.on('disconnect', () => {
        logger.warn('Redis disconnected');
        this.isConnected = false;
      });
    } catch {
      logger.warn('⚠️  Redis initialization failed. Running without Redis.');
      this.isEnabled = false;
    }
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async connect(): Promise<void> {
    if (!this.client) {
      logger.warn('⚠️  Redis client not initialized. Skipping connection.');
      return;
    }
    
    if (!this.isConnected) {
      try {
        await this.client.connect();
        this.isEnabled = true;
      } catch {
        logger.warn('⚠️  Redis connection failed. Server will continue without Redis.');
        this.isEnabled = false;
      }
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.disconnect();
        logger.info('Redis connection closed');
      } catch (error) {
        logger.warn('Error closing Redis connection:', error);
      }
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled && this.isConnected;
  }

  // Session management
  public async setSession(sessionId: string, data: unknown, expirySeconds: number = 604800): Promise<void> {
    if (!this.getIsEnabled() || !this.client) return;
    try {
      await this.client.setEx(`session:${sessionId}`, expirySeconds, JSON.stringify(data));
    } catch (error) {
      logger.warn('Redis setSession failed:', error);
    }
  }

  public async getSession(sessionId: string): Promise<unknown> {
    if (!this.getIsEnabled() || !this.client) return null;
    try {
      const data = await this.client.get(`session:${sessionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.warn('Redis getSession failed:', error);
      return null;
    }
  }

  public async deleteSession(sessionId: string): Promise<void> {
    if (!this.getIsEnabled() || !this.client) return;
    try {
      await this.client.del(`session:${sessionId}`);
    } catch (error) {
      logger.warn('Redis deleteSession failed:', error);
    }
  }

  // Cache management
  public async setCache(key: string, data: unknown, expirySeconds: number = 3600): Promise<void> {
    if (!this.getIsEnabled() || !this.client) return;
    try {
      await this.client.setEx(`cache:${key}`, expirySeconds, JSON.stringify(data));
    } catch (error) {
      logger.warn('Redis setCache failed:', error);
    }
  }

  public async getCache(key: string): Promise<unknown> {
    if (!this.getIsEnabled() || !this.client) return null;
    try {
      const data = await this.client.get(`cache:${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.warn('Redis getCache failed:', error);
      return null;
    }
  }

  public async deleteCache(key: string): Promise<void> {
    if (!this.getIsEnabled() || !this.client) return;
    try {
      await this.client.del(`cache:${key}`);
    } catch (error) {
      logger.warn('Redis deleteCache failed:', error);
    }
  }

  public async deleteCachePattern(pattern: string): Promise<void> {
    if (!this.getIsEnabled() || !this.client) return;
    try {
      const keys = await this.client.keys(`cache:${pattern}`);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      logger.warn('Redis deleteCachePattern failed:', error);
    }
  }

  // Raw Redis operations for auth/sessions
  public async setEx(key: string, seconds: number, value: string): Promise<void> {
    if (!this.getIsEnabled() || !this.client) return;
    try {
      await this.client.setEx(key, seconds, value);
    } catch (error) {
      logger.warn('Redis setEx failed:', error);
    }
  }

  public async get(key: string): Promise<string | null> {
    if (!this.getIsEnabled() || !this.client) return null;
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.warn('Redis get failed:', error);
      return null;
    }
  }

  public async getEx(key: string): Promise<string | null> {
    if (!this.getIsEnabled() || !this.client) return null;
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.warn('Redis getEx failed:', error);
      return null;
    }
  }

  public async del(keys: string | string[]): Promise<number> {
    if (!this.getIsEnabled() || !this.client) return 0;
    try {
      if (typeof keys === 'string') {
        return await this.client.del(keys);
      }
      return await this.client.del(keys);
    } catch (error) {
      logger.warn('Redis del failed:', error);
      return 0;
    }
  }

  public async exists(key: string): Promise<number> {
    if (!this.getIsEnabled() || !this.client) return 0;
    try {
      return await this.client.exists(key);
    } catch (error) {
      logger.warn('Redis exists failed:', error);
      return 0;
    }
  }

  // Rate limiting
  public async incrementRateLimit(key: string, windowMs: number): Promise<number> {
    if (!this.getIsEnabled() || !this.client) return 0;
    try {
      const rateLimitKey = `ratelimit:${key}`;
      const current = await this.client.incr(rateLimitKey);
      
      if (current === 1) {
        await this.client.expire(rateLimitKey, Math.ceil(windowMs / 1000));
      }
      
      return current;
    } catch (error) {
      logger.warn('Redis incrementRateLimit failed:', error);
      return 0;
    }
  }

  // Refresh token storage
  public async setRefreshToken(userId: string, tokenId: string, expirySeconds: number): Promise<void> {
    if (!this.getIsEnabled() || !this.client) return;
    try {
      await this.client.setEx(`refresh:${userId}:${tokenId}`, expirySeconds, 'valid');
    } catch (error) {
      logger.warn('Redis setRefreshToken failed:', error);
    }
  }

  public async validateRefreshToken(userId: string, tokenId: string): Promise<boolean> {
    if (!this.getIsEnabled() || !this.client) return false;
    try {
      const exists = await this.client.exists(`refresh:${userId}:${tokenId}`);
      return exists === 1;
    } catch (error) {
      logger.warn('Redis validateRefreshToken failed:', error);
      return false;
    }
  }

  public async revokeRefreshToken(userId: string, tokenId: string): Promise<void> {
    if (!this.getIsEnabled() || !this.client) return;
    try {
      await this.client.del(`refresh:${userId}:${tokenId}`);
    } catch (error) {
      logger.warn('Redis revokeRefreshToken failed:', error);
    }
  }

  public async revokeAllRefreshTokens(userId: string): Promise<void> {
    if (!this.getIsEnabled() || !this.client) return;
    try {
      const keys = await this.client.keys(`refresh:${userId}:*`);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      logger.warn('Redis revokeAllRefreshTokens failed:', error);
    }
  }
}

export default RedisClient.getInstance();
