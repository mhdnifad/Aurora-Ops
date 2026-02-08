import crypto from 'crypto';

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateToken = (bytes: number = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};
