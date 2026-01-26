'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useOrganization } from '@/lib/organization-context';
import { useGetOrganizations } from '@/lib/hooks';
import { usePermissions } from '@/lib/permissions';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Settings,
  ChevronDown,
  Plus,
  Loader,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/useT';


export function AppSidebar() {
  const pathname = usePathname();
  const { currentOrganization } = useOrganization();
  const { data: organizations, isLoading } = useGetOrganizations();
  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const permissions = usePermissions();
  const t = useT();

  // Define menu items with permission requirements
  const menuItems = [
    {
      label: t('nav.dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
      requiresPermission: null, // Always visible
    },
    {
      label: t('nav.projects'),
      href: '/projects',
      icon: FolderOpen,
      requiresPermission: null, // Always visible
    },
    {
      label: t('tasks.title'),
      href: '/tasks',
      icon: CheckSquare,
      requiresPermission: null, // Always visible
    },
    {
      label: t('nav.organizations'),
      href: '/organizations/members',
      icon: Users,
      requiresPermission: 'canManageMembers',
    },
    {
      label: t('nav.settings'),
      href: '/settings',
      icon: Settings,
      requiresPermission: null, // Always visible (personal settings)
    },
  ];

  // Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter((item) => {
    if (!item.requiresPermission) return true;
    return permissions[item.requiresPermission as keyof typeof permissions];
  });

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-white/10 to-white/5 dark:from-white/5 dark:to-transparent backdrop-blur-2xl border-r border-white/20 dark:border-white/10 flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-white/10 hover:bg-white/5 transition-all duration-300">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-blue-500/50 transition-all duration-300">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Aurora</span>
        </Link>
      </div>

      {/* Organization Selector */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <button
            onClick={() => setShowOrgMenu(!showOrgMenu)}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 backdrop-blur-sm"
          >
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {currentOrganization?.name || t('nav.organizations')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('nav.organizations')}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 group-open:rotate-180 transition-transform duration-300" />
          </button>

          {showOrgMenu && (
            <div className="absolute top-14 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-300">
              {isLoading ? (
                <div className="p-3 text-center">
                  <Loader className="w-4 h-4 animate-spin mx-auto" />
                </div>
              ) : Array.isArray(organizations) && organizations.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  {(organizations as any[]).map((org: any) => (
                    <Link
                      key={org._id}
                      href={`?org=${org._id}`}
                      className="block px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200"
                      onClick={() => setShowOrgMenu(false)}
                    >
                      {org.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="p-3 text-sm text-gray-500 dark:text-gray-400">{t('nav.organizations')}</p>
              )}
            </div>
          )}
        </div>

        <Link href="/organizations/new">
          <Button size="sm" variant="outline" className="w-full mt-3 backdrop-blur-sm">
            <Plus className="w-4 h-4 mr-2" />
            {t('common.save')}
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <button
                className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  active
                    ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 dark:from-blue-600/30 dark:to-indigo-600/30 text-blue-600 dark:text-blue-300 backdrop-blur-sm border border-blue-200/50 dark:border-blue-500/30 shadow-lg shadow-blue-500/10'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5 backdrop-blur-sm hover:translate-x-1 hover:shadow-md'
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-r-full shadow-lg shadow-blue-500/50"></div>
                )}
                <Icon className={`w-5 h-5 ${active ? 'text-blue-600 dark:text-blue-300' : 'group-hover:scale-110'} transition-all duration-300`} strokeWidth={2.5} />
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 backdrop-blur-sm space-y-3">
        {/* Version Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-white/10">
          <p className="font-semibold">Aurora Ops v1.0</p>
          <p className="mt-1">© 2026 {t('common.success')}</p>
        </div>
      </div>
    </aside>
  );
}
