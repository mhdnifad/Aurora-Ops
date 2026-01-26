export declare class PermissionChecker {
    /**
     * Check if user has permission in organization
     */
    static userHasPermission(userId: string, organizationId: string, _permission: string): Promise<boolean>;
    /**
     * Check if user has any of the permissions
     */
    static userHasAnyPermission(userId: string, organizationId: string, _permissions: string[]): Promise<boolean>;
    /**
     * Check if user has all permissions
     */
    static userHasAllPermissions(userId: string, organizationId: string, _permissions: string[]): Promise<boolean>;
    /**
     * Check if user has role
     */
    static userHasRole(userId: string, organizationId: string, roleName: string): Promise<boolean>;
    /**
     * Check if user has any of the roles
     */
    static userHasAnyRole(userId: string, organizationId: string, roleNames: string[]): Promise<boolean>;
    /**
     * Get user's permissions in organization
     */
    static getUserPermissions(userId: string, organizationId: string): Promise<string[]>;
    /**
     * Get user's role in organization
     */
    static getUserRole(userId: string, organizationId: string): Promise<string | null>;
}
export default PermissionChecker;
//# sourceMappingURL=checker.d.ts.map