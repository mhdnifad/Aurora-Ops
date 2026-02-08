import { LEGACY_ROLES, ORG_ROLES } from '../config/constants';

export type OrgRole = typeof ORG_ROLES[keyof typeof ORG_ROLES];

const ROLE_ALIAS_MAP: Record<string, OrgRole> = {
  [ORG_ROLES.COMPANY_ADMIN]: ORG_ROLES.COMPANY_ADMIN,
  [ORG_ROLES.MANAGER]: ORG_ROLES.MANAGER,
  [ORG_ROLES.EMPLOYEE]: ORG_ROLES.EMPLOYEE,
  [ORG_ROLES.CLIENT]: ORG_ROLES.CLIENT,
  [LEGACY_ROLES.OWNER]: ORG_ROLES.COMPANY_ADMIN,
  [LEGACY_ROLES.ADMIN]: ORG_ROLES.COMPANY_ADMIN,
  [LEGACY_ROLES.MEMBER]: ORG_ROLES.EMPLOYEE,
  [LEGACY_ROLES.VIEWER]: ORG_ROLES.CLIENT,
  [LEGACY_ROLES.GUEST]: ORG_ROLES.CLIENT,
};

export const normalizeOrgRole = (role?: string | null): OrgRole | null => {
  if (!role) {
    return null;
  }
  return ROLE_ALIAS_MAP[role] || null;
};
