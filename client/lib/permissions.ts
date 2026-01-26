import { useAuth } from './auth-context';
import { useOrganization } from './organization-context';

export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | 'guest';

export interface RolePermissions {
  canManageOrganization: boolean;
  canDeleteOrganization: boolean;
  canManageMembers: boolean;
  canViewBilling: boolean;
  canManageBilling: boolean;
  canViewAuditLogs: boolean;
  canCreateProjects: boolean;
  canDeleteProjects: boolean;
  canManageProjects: boolean;
  canCreateTasks: boolean;
  canDeleteTasks: boolean;
  canAssignTasks: boolean;
  canManageClients: boolean;
  canViewAnalytics: boolean;
  canUseAI: boolean;
}

const rolePermissionsMap: Record<UserRole, RolePermissions> = {
  owner: {
    canManageOrganization: true,
    canDeleteOrganization: true,
    canManageMembers: true,
    canViewBilling: true,
    canManageBilling: true,
    canViewAuditLogs: true,
    canCreateProjects: true,
    canDeleteProjects: true,
    canManageProjects: true,
    canCreateTasks: true,
    canDeleteTasks: true,
    canAssignTasks: true,
    canManageClients: true,
    canViewAnalytics: true,
    canUseAI: true,
  },
  admin: {
    canManageOrganization: true,
    canDeleteOrganization: false,
    canManageMembers: true,
    canViewBilling: true,
    canManageBilling: true,
    canViewAuditLogs: true,
    canCreateProjects: true,
    canDeleteProjects: true,
    canManageProjects: true,
    canCreateTasks: true,
    canDeleteTasks: true,
    canAssignTasks: true,
    canManageClients: true,
    canViewAnalytics: true,
    canUseAI: true,
  },
  manager: {
    canManageOrganization: false,
    canDeleteOrganization: false,
    canManageMembers: false,
    canViewBilling: false,
    canManageBilling: false,
    canViewAuditLogs: false,
    canCreateProjects: true,
    canDeleteProjects: false,
    canManageProjects: true,
    canCreateTasks: true,
    canDeleteTasks: false,
    canAssignTasks: true,
    canManageClients: true,
    canViewAnalytics: true,
    canUseAI: true,
  },
  member: {
    canManageOrganization: false,
    canDeleteOrganization: false,
    canManageMembers: false,
    canViewBilling: false,
    canManageBilling: false,
    canViewAuditLogs: false,
    canCreateProjects: false,
    canDeleteProjects: false,
    canManageProjects: false,
    canCreateTasks: true,
    canDeleteTasks: false,
    canAssignTasks: false,
    canManageClients: false,
    canViewAnalytics: false,
    canUseAI: false,
  },
  guest: {
    canManageOrganization: false,
    canDeleteOrganization: false,
    canManageMembers: false,
    canViewBilling: false,
    canManageBilling: false,
    canViewAuditLogs: false,
    canCreateProjects: false,
    canDeleteProjects: false,
    canManageProjects: false,
    canCreateTasks: false,
    canDeleteTasks: false,
    canAssignTasks: false,
    canManageClients: false,
    canViewAnalytics: false,
    canUseAI: false,
  },
};

export function usePermissions(): RolePermissions & { role: UserRole | null; isLoading: boolean } {
  const { userRole, isLoading } = useAuth();
  const { currentOrganization } = useOrganization();

  if (!userRole || !currentOrganization || isLoading) {
    return {
      role: null,
      isLoading,
      ...rolePermissionsMap.guest,
    };
  }

  return {
    role: userRole,
    isLoading: false,
    ...rolePermissionsMap[userRole],
  };
}
