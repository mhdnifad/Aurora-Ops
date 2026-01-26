'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';
import { useGetCurrentUser } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  currentRole?: 'owner' | 'admin' | 'manager' | 'member' | 'guest';
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: 'owner' | 'admin' | 'manager' | 'member' | 'guest' | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string, passwordConfirm: string) => Promise<void>;
  logout: () => Promise<void>;
  setUserRole: (role: 'owner' | 'admin' | 'manager' | 'member' | 'guest') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'manager' | 'member' | 'guest' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTokens, setHasTokens] = useState(false);
  const queryClient = useQueryClient();

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

  const { data: currentUserData, isLoading: isFetching } = useGetCurrentUser({
    queryKey: ['currentUser'],
    retry: 1,
    enabled: hasTokens,
  } as any);

  // Set user when currentUser data is fetched
  useEffect(() => {
    if ((currentUserData as any)?.user) {
      setUser((currentUserData as any).user);
      // User data fetched successfully, stop loading
      setIsLoading(false);
    }
    // Only keep loading if we have tokens and are still fetching AND user is not yet set
    if (hasTokens && isFetching && !user) {
      setIsLoading(true);
    }
    // If query finished but no user and we have tokens, still stop loading
    if (hasTokens && !isFetching && !user) {
      setIsLoading(false);
    }
  }, [currentUserData, isFetching, hasTokens, user]);

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
