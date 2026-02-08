import { getUserMembership } from '../middlewares/tenant.middleware';
import { DEFAULT_ROLE_PERMISSIONS, roleHasAnyPermission, roleHasAllPermissions } from './definitions';
import { normalizeOrgRole } from '../utils/roles';
import { PERMISSION_ALIASES } from '../config/constants';
import User from '../models/User';

const isAdmin = async (userId: string): Promise<boolean> => {
  const user = await User.findById(userId).select('systemRole');
  return user?.systemRole === 'admin';
};

export class PermissionChecker {
  /**
   * Check if user has permission in organization
   * Currently checks if user is admin or owner (granular permission checking reserved for future)
   */
  static async userHasPermission(
    userId: string,
    organizationId: string,
    permission?: string
  ): Promise<boolean> {
    try {
      if (await isAdmin(userId)) {
        return true;
      }

      const membership = await getUserMembership(userId, organizationId);
      
      if (!membership) {
        return false;
      }

      if (!permission) {
        return true;
      }

      const normalizedRole = normalizeOrgRole(membership.role);
      if (!normalizedRole) {
        return false;
      }

      const rolePermissions = DEFAULT_ROLE_PERMISSIONS[normalizedRole] || [];
      const resolved = PERMISSION_ALIASES[permission] || [permission];
      return roleHasAnyPermission(rolePermissions, resolved);
    } catch {
      return false;
    }
  }

  /**
   * Check if user has any of the permissions
   */
  static async userHasAnyPermission(
    userId: string,
    organizationId: string,
    permissions: string[]
  ): Promise<boolean> {
    try {
      if (await isAdmin(userId)) {
        return true;
      }

      const membership = await getUserMembership(userId, organizationId);
      
      if (!membership) {
        return false;
      }

      const normalizedRole = normalizeOrgRole(membership.role);
      if (!normalizedRole) {
        return false;
      }

      const rolePermissions = DEFAULT_ROLE_PERMISSIONS[normalizedRole] || [];
      const resolved = permissions.flatMap((permission) =>
        PERMISSION_ALIASES[permission] ? PERMISSION_ALIASES[permission] : [permission]
      );
      return roleHasAnyPermission(rolePermissions, resolved);
    } catch {
      return false;
    }
  }

  /**
   * Check if user has all permissions
   */
  static async userHasAllPermissions(
    userId: string,
    organizationId: string,
    permissions: string[]
  ): Promise<boolean> {
    try {
      if (await isAdmin(userId)) {
        return true;
      }

      const membership = await getUserMembership(userId, organizationId);
      
      if (!membership) {
        return false;
      }

      const normalizedRole = normalizeOrgRole(membership.role);
      if (!normalizedRole) {
        return false;
      }

      const rolePermissions = DEFAULT_ROLE_PERMISSIONS[normalizedRole] || [];
      const resolved = permissions.flatMap((permission) =>
        PERMISSION_ALIASES[permission] ? PERMISSION_ALIASES[permission] : [permission]
      );
      return roleHasAllPermissions(rolePermissions, resolved);
    } catch {
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
      if (await isAdmin(userId)) {
        return roleName === 'admin';
      }

      const membership = await getUserMembership(userId, organizationId);
      
      if (!membership) {
        return false;
      }

      const normalizedRole = normalizeOrgRole(membership.role);
      const normalizedRequired = normalizeOrgRole(roleName) || roleName;
      return normalizedRole ? normalizedRole === normalizedRequired : false;
    } catch {
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
      if (await isAdmin(userId)) {
        return roleNames.includes('admin');
      }

      const membership = await getUserMembership(userId, organizationId);
      
      if (!membership) {
        return false;
      }

      const normalizedRole = normalizeOrgRole(membership.role);
      const normalizedRoles = roleNames
        .map((role) => normalizeOrgRole(role) || role)
        .filter(Boolean);
      return normalizedRole ? normalizedRoles.includes(normalizedRole) : false;
    } catch {
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
      if (await isAdmin(userId)) {
        return Object.values(DEFAULT_ROLE_PERMISSIONS).flat();
      }

      const membership = await getUserMembership(userId, organizationId);
      
      if (!membership) {
        return [];
      }

      const normalizedRole = normalizeOrgRole(membership.role);
      if (!normalizedRole) {
        return [];
      }
      return DEFAULT_ROLE_PERMISSIONS[normalizedRole] || [];
    } catch {
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
      if (await isAdmin(userId)) {
        return 'admin';
      }

      const membership = await getUserMembership(userId, organizationId);
      
      if (!membership) {
        return null;
      }

      return normalizeOrgRole(membership.role);
    } catch {
      return null;
    }
  }
}

export default PermissionChecker;
