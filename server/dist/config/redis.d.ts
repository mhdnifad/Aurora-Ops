import { createClient } from 'redis';
declare class RedisClient {
    private static instance;
    client: ReturnType<typeof createClient> | null;
    private isConnected;
    private isEnabled;
    private connectionAttempts;
    private maxConnectionAttempts;
    private constructor();
    static getInstance(): RedisClient;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getIsEnabled(): boolean;
    setSession(sessionId: string, data: any, expirySeconds?: number): Promise<void>;
    getSession(sessionId: string): Promise<any>;
    deleteSession(sessionId: string): Promise<void>;
    setCache(key: string, data: any, expirySeconds?: number): Promise<void>;
    getCache(key: string): Promise<any>;
    deleteCache(key: string): Promise<void>;
    deleteCachePattern(pattern: string): Promise<void>;
    setEx(key: string, seconds: number, value: string): Promise<void>;
    get(key: string): Promise<string | null>;
    getEx(key: string): Promise<string | null>;
    del(keys: string | string[]): Promise<number>;
    exists(key: string): Promise<number>;
    incrementRateLimit(key: string, windowMs: number): Promise<number>;
    setRefreshToken(userId: string, tokenId: string, expirySeconds: number): Promise<void>;
    validateRefreshToken(userId: string, tokenId: string): Promise<boolean>;
    revokeRefreshToken(userId: string, tokenId: string): Promise<void>;
    revokeAllRefreshTokens(userId: string): Promise<void>;
}
declare const _default: RedisClient;
export default _default;
//# sourceMappingURL=redis.d.ts.map