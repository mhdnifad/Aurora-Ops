'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './auth-context';
import { apiClient } from './api-client';
import { normalizeUserRole } from './roles';

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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentOrganization');
      }
      setCurrentOrganizationState(null);
      setOrganizations([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const orgs = await apiClient.getOrganizations(1, 100);
      setOrganizations(orgs || []);
      
      // If no current org is set, use the first one from the list
      const stored = localStorage.getItem('currentOrganization');
      if (orgs && orgs.length > 0) {
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as Organization;
            const exists = orgs.some((org) => org._id === parsed._id);
            if (!exists) {
              setCurrentOrganizationState(orgs[0]);
              localStorage.setItem('currentOrganization', JSON.stringify(orgs[0]));
            }
          } catch (e) {
            setCurrentOrganizationState(orgs[0]);
            localStorage.setItem('currentOrganization', JSON.stringify(orgs[0]));
          }
        } else {
          setCurrentOrganizationState(orgs[0]);
          localStorage.setItem('currentOrganization', JSON.stringify(orgs[0]));
        }
      } else if (stored) {
        localStorage.removeItem('currentOrganization');
        setCurrentOrganizationState(null);
      }
    } catch (error) {
      // Failed to load organizations
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load from localStorage on mount and load organizations once when authenticated
  React.useEffect(() => {
    const stored = localStorage.getItem('currentOrganization');
    if (stored) {
      try {
        setCurrentOrganizationState(JSON.parse(stored));
        setIsLoading(false);
      } catch (e) {
        // Invalid JSON in localStorage
        localStorage.removeItem('currentOrganization');
      }
    }
    
    // Load organizations if authenticated
    if (isAuthenticated) {
      loadOrganizations();
    } else {
      setCurrentOrganizationState(null);
      setOrganizations([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch user role when organization changes
  React.useEffect(() => {
    const fetchUserRole = async () => {
      if (!isAuthenticated || !currentOrganization?._id) {
        setUserRole(null);
        return;
      }

      if (typeof window !== 'undefined') {
        const storedTokens = localStorage.getItem('auth_tokens');
        if (!storedTokens) {
          setUserRole(null);
          return;
        }
      }

      try {
        const response = await apiClient.get('/api/user/role');
        const role = (response as any)?.data?.role;
        if (role) {
          setUserRole(normalizeUserRole(role));
        } else {
          setUserRole(null);
        }
      } catch (error: any) {
        setUserRole(null);

        const status = error?.response?.status;
        if (status === 400 || status === 401 || status === 403 || status === 404) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('currentOrganization');
          }
          setCurrentOrganizationState(null);
          loadOrganizations();
        }
      }
    };

    fetchUserRole();
  }, [currentOrganization, isAuthenticated, loadOrganizations, setUserRole]);

  const setCurrentOrganization = useCallback((org: Organization | null) => {
    if (org) {
      localStorage.setItem('currentOrganization', JSON.stringify(org));
    } else {
      localStorage.removeItem('currentOrganization');
    }
    setCurrentOrganizationState(org);
  }, []);

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
