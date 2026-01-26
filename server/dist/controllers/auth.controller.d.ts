/**
 * Register a new user
 */
export declare const register: (req: any, res: any, next: any) => void;
/**
 * Login user
 */
export declare const login: (req: any, res: any, next: any) => void;
/**
 * Refresh access token
 */
export declare const refreshToken: (req: any, res: any, next: any) => void;
/**
 * Logout user
 */
export declare const logout: (req: any, res: any, next: any) => void;
/**
 * Get current user
 */
export declare const getCurrentUser: (req: any, res: any, next: any) => void;
/**
 * Forgot password - send reset email
 */
export declare const forgotPassword: (req: any, res: any, next: any) => void;
/**
 * Reset password
 */
export declare const resetPassword: (req: any, res: any, next: any) => void;
/**
 * Change password (for authenticated users)
 */
export declare const changePassword: (req: any, res: any, next: any) => void;
/**
 * Verify email token (for email verification feature)
 */
export declare const verifyEmail: (req: any, res: any, next: any) => void;
//# sourceMappingURL=auth.controller.d.ts.map