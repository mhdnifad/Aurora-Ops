'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useSocket } from '@/lib/socket-context';
import { useOrganization } from '@/lib/organization-context';
import { OnlineIndicator } from '@/components/ui/realtime-indicators';
import { useT } from '@/lib/useT';
import {
  Bell,
  Search,
  LogOut,
  Settings,
  User,
  ChevronDown,
  Loader,
  Sun,
  Moon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import NotificationCenter from '@/components/ui/notification-center';

export function TopNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useSocket();
  const { currentOrganization } = useOrganization();
  const t = useT();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setShowUserMenu(false);
    try {
      await logout();
      // Use replace to prevent back navigation
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <Input
              type="search"
              placeholder="Search projects, tasks..."
              className="pl-10 bg-gray-50/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 focus:bg-white dark:focus:bg-gray-800 transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Connection status */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-medium"
            title={isConnected ? 'Live updates on' : currentOrganization ? 'Connecting realtime' : 'Realtime paused'}
          >
            <span
              className={`inline-flex w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]' : 'bg-amber-500 animate-pulse'
              }`}
            />
            <span className="text-gray-700 dark:text-gray-200">
              {isConnected ? 'Live' : currentOrganization ? 'Connecting' : 'Paused'}
            </span>
          </div>

          <OnlineIndicator />

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200 hover:scale-105"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>
          )}

          {/* Notifications */}
          <NotificationCenter />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition"
            >
              {(user as any)?.avatar ? (
                <img
                  src={(user as any).avatar}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.firstName?.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.firstName} {user?.lastName}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-12 w-52 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl shadow-2xl z-50">
                <div className="p-3 border-b border-gray-200/70 dark:border-gray-700/70">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>

                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      router.push('/settings/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-gray-700/60 rounded"
                  >
                    <User className="w-4 h-4" />
                    {t('settings.profile')}
                  </button>
                  <button
                    onClick={() => {
                      router.push('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-gray-700/60 rounded"
                  >
                    <Settings className="w-4 h-4" />
                    {t('settings.title')}
                  </button>
                </div>

                <div className="p-2 border-t border-gray-200/70 dark:border-gray-700/70">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 rounded"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        {t('common.loading')}
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" />
                        {t('common.close')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
