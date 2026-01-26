'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import {
  User,
  Zap,
  Bell,
  Users,
  Building,
  Shield,
  CreditCard,
  Brain,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/preferences', label: 'Preferences', icon: Zap },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/organization', label: 'Organization', icon: Building },
  { href: '/settings/members', label: 'Members', icon: Users },
  { href: '/settings/billing', label: 'Billing', icon: CreditCard },
  { href: '/settings/ai', label: 'AI', icon: Brain },
  { href: '/settings/api', label: 'API Keys', icon: Shield },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 rounded-2xl p-8 text-white shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-white/80 text-lg">Manage your account and organization</p>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-2 backdrop-blur-xl bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 shadow-md sticky top-6 h-fit">
            <nav className="space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link key={href} href={href}>
                    <button
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-md hover:shadow-lg'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{label}</span>
                    </button>
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-white/20 dark:border-white/10">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-all text-left font-medium">
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  Logout
                </button>
              </div>
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}
