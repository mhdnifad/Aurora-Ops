'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';
import { useGetCurrentUser } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { UserRole } from './roles';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  currentRole?: UserRole;
  systemRole?: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string, passwordConfirm: string) => Promise<void>;
  logout: () => Promise<void>;
  setUserRole: (role: UserRole | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTokens, setHasTokens] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  // Check if user has tokens on mount
  useEffect(() => {
    const checkTokens = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('auth_tokens');
        setHasTokens(!!stored);
        setIsLoading(false);
      }
    };
    checkTokens();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleAuthTokens = (event: Event) => {
      const customEvent = event as CustomEvent<{ hasTokens: boolean }>;
      const hasTokensValue = !!customEvent.detail?.hasTokens;

      setHasTokens(hasTokensValue);

      if (!hasTokensValue) {
        setUser(null);
        setUserRole(null);
        queryClient.clear();
        setIsLoading(false);

        if (!pathname?.startsWith('/login') && !pathname?.startsWith('/register') && !pathname?.startsWith('/reset-password')) {
          router.replace('/login');
        }
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'auth_tokens') {
        return;
      }

      const hasTokensValue = !!event.newValue;
      setHasTokens(hasTokensValue);

      if (!hasTokensValue) {
        setUser(null);
        setUserRole(null);
        queryClient.clear();
        setIsLoading(false);

        if (!pathname?.startsWith('/login') && !pathname?.startsWith('/register') && !pathname?.startsWith('/reset-password')) {
          router.replace('/login');
        }
      }
    };

    window.addEventListener('auth:tokens', handleAuthTokens);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('auth:tokens', handleAuthTokens);
      window.removeEventListener('storage', handleStorage);
    };
  }, [pathname, queryClient, router]);

  const { data: currentUserData, isLoading: isFetching } = useGetCurrentUser({
    queryKey: ['currentUser'],
    retry: 1,
    enabled: hasTokens,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  } as any);

  // Set user when currentUser data is fetched - removed 'user' from dependencies to prevent infinite loops
  useEffect(() => {
    if ((currentUserData as any)?.user) {
      setUser((currentUserData as any).user);
      setIsLoading(false);
    } else if (!isFetching && hasTokens) {
      // Finished fetching but no user
      setIsLoading(false);
    } else if (!hasTokens) {
      // No tokens, not loading
      setIsLoading(false);
    }
  }, [currentUserData, isFetching, hasTokens]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      if (response.tokens) {
        apiClient.setTokens(response.tokens.accessToken, response.tokens.refreshToken);
      }
      setUser(response.user);
      setHasTokens(true);
      setIsLoading(false);
      // Invalidate currentUser query to fetch fresh user data
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    } catch (error) {
      setHasTokens(false);
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string, passwordConfirm: string) => {
    try {
      const response = await apiClient.register(firstName, lastName, email, password, passwordConfirm);
      if (response.tokens) {
        apiClient.setTokens(response.tokens.accessToken, response.tokens.refreshToken);
      }
      setUser(response.user);
      setHasTokens(true);
      setIsLoading(false);
      // Invalidate currentUser query to fetch fresh user data
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    } catch (error) {
      setHasTokens(false);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all cached data
      queryClient.clear();
      setUser(null);
      setHasTokens(false);
      // Redirect will be handled by the component
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        isAuthenticated: !!user,
        userRole,
        login,
        register,
        logout,
        setUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
