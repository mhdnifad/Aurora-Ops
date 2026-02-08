import jwt, { SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import config from '../config/env';
import { AuthenticationError } from './errors';

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
    const expiresIn = config.jwt.expiresIn as SignOptions['expiresIn'];
    const options: SignOptions = {
      expiresIn,
      issuer: 'aurora-ops',
      audience: 'aurora-ops-api',
    };
    return jwt.sign(payload, config.jwt.secret, options);
  }

  /**
   * Generate refresh token (long-lived)
   */
  public static generateRefreshToken(payload: JwtPayload): {
    token: string;
    tokenId: string;
  } {
    const tokenId = randomUUID();
    const expiresIn = config.jwt.refreshExpiresIn as SignOptions['expiresIn'];
    const options: SignOptions = {
      expiresIn,
      issuer: 'aurora-ops',
      audience: 'aurora-ops-api',
    };
    const token = jwt.sign(
      { ...payload, tokenId },
      config.jwt.refreshSecret,
      options
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
        throw new AuthenticationError('Access token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid access token');
      }
      throw new AuthenticationError('Invalid access token');
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
        throw new AuthenticationError('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  public static decodeToken(token: string): unknown {
    return jwt.decode(token);
  }

  /**
   * Get token expiration time
   */
  public static getTokenExpiration(token: string): Date | null {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  }
}

export default JWTUtil;
