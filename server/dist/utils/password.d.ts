export declare class PasswordUtil {
    private static readonly SALT_ROUNDS;
    /**
     * Hash password using bcrypt
     */
    static hash(password: string): Promise<string>;
    /**
     * Compare password with hash
     */
    static compare(password: string, hash: string): Promise<boolean>;
    /**
     * Validate password strength
     */
    static validateStrength(password: string): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Generate random password
     */
    static generateRandom(length?: number): string;
}
export default PasswordUtil;
//# sourceMappingURL=password.d.ts.map