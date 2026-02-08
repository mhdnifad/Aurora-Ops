'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import {
  Building2,
  Users,
  User,
  Bell,
  Key,
  Settings as SettingsIcon,
  ArrowRight,
} from 'lucide-react';
import { useT } from '@/lib/useT';

function getSettingsSections(t: (key: string) => string) {
  return [
    {
      title: t('settings.title'),
      description: t('settings.profile'),
      icon: Building2,
      href: '/settings/organization',
    },
    {
      title: t('nav.organizations'),
      description: t('settings.preferences'),
      icon: Users,
      href: '/settings/members',
    },
    {
      title: t('settings.profile'),
      description: t('settings.profile'),
      icon: User,
      href: '/settings/profile',
    },
    {
      title: t('settings.preferences'),
      description: t('settings.preferences'),
      icon: Bell,
      href: '/settings/notifications',
    },
    {
      title: t('settings.title'),
      description: t('settings.title'),
      icon: Key,
      href: '/settings/api',
    },
    {
      title: t('settings.preferences'),
      description: t('settings.preferences'),
      icon: SettingsIcon,
      href: '/settings/preferences',
    },
  ];
}

export default function SettingsPage() {
  const t = useT();
  const settingsSections = getSettingsSections(t);
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('settings.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('settings.preferences')}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Manage account + workspace
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-xl">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition" />
                </div>
                <h2 className="font-bold text-lg mb-1 text-gray-900 dark:text-gray-100">{section.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{section.description}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
