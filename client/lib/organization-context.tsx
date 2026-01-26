'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './auth-context';
import { apiClient } from './api-client';

interface Organization {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  owner: string;
  createdAt: string;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization | null) => void;
  organizations: Organization[];
  loadOrganizations: () => Promise<void>;
  isLoading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, setUserRole } = useAuth();

  // Load organizations from API
  const loadOrganizations = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const orgs = await apiClient.getOrganizations(1, 100);
      setOrganizations(orgs || []);
      
      // If no current org is set, use the first one from the list
      const stored = localStorage.getItem('currentOrganization');
      if (!stored && orgs && orgs.length > 0) {
        setCurrentOrganizationState(orgs[0]);
        localStorage.setItem('currentOrganization', JSON.stringify(orgs[0]));
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('currentOrganization');
    if (stored) {
      try {
        setCurrentOrganizationState(JSON.parse(stored));
        setIsLoading(false);
      } catch (e) {
        // Invalid JSON in localStorage, continue to fetch
        loadOrganizations();
      }
    }
  }, []);

  // Load organizations when authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      loadOrganizations();
    }
  }, [isAuthenticated, loadOrganizations]);

  // Fetch user role when organization changes
  React.useEffect(() => {
    const fetchUserRole = async () => {
      if (!currentOrganization?._id) {
        setUserRole(null as any);
        return;
      }
      
      try {
        const response = await apiClient.get('user/role');
        if ((response as any)?.data?.role) {
          setUserRole((response as any).data.role);
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        setUserRole(null as any);
      }
    };

    fetchUserRole();
  }, [currentOrganization, setUserRole]);

  const setCurrentOrganization = useCallback((org: Organization | null) => {
    if (org) {
      localStorage.setItem('currentOrganization', JSON.stringify(org));
    } else {
      localStorage.removeItem('currentOrganization');
    }
    setCurrentOrganizationState(org);
  }, []);

  // If authenticated and no org is stored, hydrate with the first available org
  React.useEffect(() => {
    const hydrateOrg = async () => {
      if (!isAuthenticated || currentOrganization) return;
      try {
        const orgs = await apiClient.getOrganizations(1, 1);
        if (orgs?.length) {
          setCurrentOrganization(orgs[0]);
        }
      } catch (error) {
        // Silent fail; user will select org later
      }
    };

    hydrateOrg();
  }, [isAuthenticated, currentOrganization, setCurrentOrganization]);

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        setCurrentOrganization,
        organizations,
        loadOrganizations,
        isLoading,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
