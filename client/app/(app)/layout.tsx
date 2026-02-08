'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useOrganization } from '@/lib/organization-context';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/topnav';
import { ColorBendsSurface } from '@/components/ui/color-bends-surface';
import { FloatingLinesSurface } from '@/components/ui/floating-lines-surface';
import '../globals.css';

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { isLoading: orgLoading } = useOrganization();
  const router = useRouter();

  useEffect(() => {
    // Only redirect once if we've finished checking auth and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated]);

  // Show loading spinner while checking auth
  if (isLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50/40 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-200/20 via-transparent to-transparent dark:from-emerald-900/10 pointer-events-none"></div>
      <div className="fixed -top-24 left-0 right-0 h-[420px] opacity-25 pointer-events-none">
        <ColorBendsSurface />
      </div>
      <div className="fixed top-0 left-0 right-0 h-[360px] opacity-20 pointer-events-none">
        <FloatingLinesSurface />
      </div>
      
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <TopNav />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
