'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/auth-context';
import { OrganizationProvider } from '@/lib/organization-context';
import { SocketProvider } from '@/lib/socket-context';

import { LanguageProvider } from '@/lib/language-context';
import { TimezoneProvider } from '@/lib/timezone-context';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TimezoneProvider>
            <OrganizationProvider>
              <SocketProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="theme">
                  {children}
                  <Toaster position="top-right" richColors />
                </ThemeProvider>
              </SocketProvider>
            </OrganizationProvider>
          </TimezoneProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
