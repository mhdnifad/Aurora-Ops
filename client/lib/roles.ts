export type UserRole = 'super_admin' | 'company_admin' | 'manager' | 'employee' | 'client';

const ROLE_ALIASES: Record<string, UserRole> = {
  super_admin: 'super_admin',
  company_admin: 'company_admin',
  manager: 'manager',
  employee: 'employee',
  client: 'client',
  owner: 'company_admin',
  admin: 'company_admin',
  member: 'employee',
  viewer: 'client',
  guest: 'client',
};

export const normalizeUserRole = (role?: string | null): UserRole | null => {
  if (!role) {
    return null;
  }
  return ROLE_ALIASES[role] || null;
};
