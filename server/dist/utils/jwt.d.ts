interface JwtPayload {
    userId: string;
    email: string;
    organizationId?: string;
}
interface RefreshTokenPayload extends JwtPayload {
    tokenId: string;
}
export declare class JWTUtil {
    /**
     * Generate access token (short-lived)
     */
    static generateAccessToken(payload: JwtPayload): string;
    /**
     * Generate refresh token (long-lived)
     */
    static generateRefreshToken(payload: JwtPayload): {
        token: string;
        tokenId: string;
    };
    /**
     * Verify access token
     */
    static verifyAccessToken(token: string): JwtPayload;
    /**
     * Verify refresh token
     */
    static verifyRefreshToken(token: string): RefreshTokenPayload;
    /**
     * Decode token without verification (for debugging)
     */
    static decodeToken(token: string): any;
    /**
     * Get token expiration time
     */
    static getTokenExpiration(token: string): Date | null;
}
export default JWTUtil;
//# sourceMappingURL=jwt.d.ts.map