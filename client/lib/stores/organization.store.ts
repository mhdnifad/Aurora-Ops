import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  logo?: string;
}

interface OrganizationState {
  currentOrganization: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  setCurrentOrganization: (org: Organization) => void;
  setOrganizations: (orgs: Organization[]) => void;
  addOrganization: (org: Organization) => void;
  updateOrganization: (id: string, data: Partial<Organization>) => void;
  removeOrganization: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  devtools(
    (set) => ({
      currentOrganization: null,
      organizations: [],
      isLoading: false,

      setCurrentOrganization: (org) =>
        set({ currentOrganization: org }),

      setOrganizations: (orgs) =>
        set({ organizations: orgs }),

      addOrganization: (org) =>
        set((state) => ({
          organizations: [...state.organizations, org],
        })),

      updateOrganization: (id, data) =>
        set((state) => ({
          organizations: state.organizations.map((org) =>
            org.id === id ? { ...org, ...data } : org
          ),
          currentOrganization:
            state.currentOrganization?.id === id
              ? { ...state.currentOrganization, ...data }
              : state.currentOrganization,
        })),

      removeOrganization: (id) =>
        set((state) => ({
          organizations: state.organizations.filter((org) => org.id !== id),
          currentOrganization:
            state.currentOrganization?.id === id ? null : state.currentOrganization,
        })),

      setLoading: (loading) =>
        set({ isLoading: loading }),
    }),
    { name: 'Organization Store' }
  )
);
