import { getUserMembership } from '../middlewares/tenant.middleware';

export class PermissionChecker {
  /**
   * Check if user has permission in organization
   */
  static async userHasPermission(
    userId: string,
    organizationId: string,
    _permission: string
  ): Promise<boolean> {
    try {
      const membership = await getUserMembership(userId, organizationId);
      
      if (!membership) {
        return false;
      }

      return ['admin', 'owner'].includes(membership.role);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user has any of the permissions
   */
  static async userHasAnyPermission(
    userId: string,
    organizationId: string,
    _permissions: string[]
  ): Promise<boolean> {
    try {
      const membership = await getUserMembership(userId, organizationId);
      
      if (!membership) {
        return false;
      }

      return ['admin', 'owner'].includes(membership.role);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user has all permissions
   */
  static async userHasAllPermissions(
    userId: string,
    organizationId: string,
    _permissions: string[]
  ): Promise<boolean> {
    try {
      const membership = await getUserMembership(userId, organizationId);
      
      if (!membership) {
        return false;
      }

      return ['admin', 'owner'].includes(membership.role);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user has role
   */
  static async userHasRole(
    userId: string,
    organizationId: string,
    roleName: string
  ): Promise<boolean> {
    try {
      const membership = await getUserMembership(userId, organizationId);
      
      if (!membership) {
        return false;
      }

      return membership.role === roleName;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user has any of the roles
   */
  static async userHasAnyRole(
    userId: string,
    organizationId: string,
    roleNames: string[]
  ): Promise<boolean> {
    try {
      const membership = await getUserMembership(userId, organizationId);
      
      if (!membership) {
        return false;
      }

      return roleNames.includes(membership.role);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user's permissions in organization
   */
  static async getUserPermissions(
    userId: string,
    organizationId: string
  ): Promise<string[]> {
    try {
      const membership = await getUserMembership(userId, organizationId);
      
      if (!membership) {
        return [];
      }

      // Return basic permissions based on role
      if (membership.role === 'owner' || membership.role === 'admin') {
        return ['read', 'write', 'delete', 'manage_members'];
      }
      return ['read'];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get user's role in organization
   */
  static async getUserRole(
    userId: string,
    organizationId: string
  ): Promise<string | null> {
    try {
      const membership = await getUserMembership(userId, organizationId);
      
      if (!membership) {
        return null;
      }

      return membership.role;
    } catch (error) {
      return null;
    }
  }
}

export default PermissionChecker;
