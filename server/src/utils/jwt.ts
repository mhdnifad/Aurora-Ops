import jwt from 'jsonwebtoken';
import config from '../config/env';
import { v4 as uuidv4 } from 'uuid';

interface JwtPayload {
  userId: string;
  email: string;
  organizationId?: string;
}

interface RefreshTokenPayload extends JwtPayload {
  tokenId: string;
}

export class JWTUtil {
  /**
   * Generate access token (short-lived)
   */
  public static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as string,
      issuer: 'aurora-ops',
      audience: 'aurora-ops-api',
    } as any);
  }

  /**
   * Generate refresh token (long-lived)
   */
  public static generateRefreshToken(payload: JwtPayload): {
    token: string;
    tokenId: string;
  } {
    const tokenId = uuidv4();
    const token = jwt.sign(
      { ...payload, tokenId },
      config.jwt.refreshSecret,
      {
        expiresIn: config.jwt.refreshExpiresIn as string,
        issuer: 'aurora-ops',
        audience: 'aurora-ops-api',
      } as any
    );
    return { token, tokenId };
  }

  /**
   * Verify access token
   */
  public static verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.secret, {
        issuer: 'aurora-ops',
        audience: 'aurora-ops-api',
      }) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      }
      throw error;
    }
  }

  /**
   * Verify refresh token
   */
  public static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret, {
        issuer: 'aurora-ops',
        audience: 'aurora-ops-api',
      }) as RefreshTokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  public static decodeToken(token: string): any {
    return jwt.decode(token);
  }

  /**
   * Get token expiration time
   */
  public static getTokenExpiration(token: string): Date | null {
    const decoded = jwt.decode(token) as any;
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  }
}

export default JWTUtil;
