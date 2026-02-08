'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Loader } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function NotificationsSettingsPage() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const rowClass = 'flex items-center justify-between gap-6 rounded-xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 p-4 shadow-sm';
  const toggleClass = 'h-5 w-5 rounded border-gray-300 dark:border-white/20 text-blue-600 focus:ring-blue-200';
  const [preferences, setPreferences] = useState({
    emailOnTaskAssigned: true,
    emailOnTaskComment: true,
    emailOnProjectInvite: true,
    emailOnMemberJoined: false,
    emailDigest: true,
    pushNotifications: true,
  });

  const handleChange = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const notifications = {
        email: preferences.emailOnTaskAssigned || preferences.emailOnTaskComment || preferences.emailOnProjectInvite || preferences.emailOnMemberJoined || preferences.emailDigest,
        push: preferences.pushNotifications,
        inApp: true,
      };
      await apiClient.updateUserPreferences('light', notifications, 'en', 'UTC', preferences.emailDigest ? 'daily' : 'off');
      
      // Invalidate queries to refresh preferences
      await queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      toast.success('Notification preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Choose how you receive notifications</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Realtime alerts
        </div>
      </div>

      {/* Email Notifications */}
      <Card className="p-8 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md">
        <h2 className="text-lg font-bold mb-6">Email notifications</h2>

        <div className="space-y-4">
          <div className={rowClass}>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Task assigned to you</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get notified when a task is assigned to you
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailOnTaskAssigned}
              onChange={() => handleChange('emailOnTaskAssigned')}
              className={toggleClass}
            />
          </div>

          <div className={rowClass}>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">New comments on tasks</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get notified when someone comments on your tasks
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailOnTaskComment}
              onChange={() => handleChange('emailOnTaskComment')}
              className={toggleClass}
            />
          </div>

          <div className={rowClass}>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Project invitations</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get notified when you're invited to projects
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailOnProjectInvite}
              onChange={() => handleChange('emailOnProjectInvite')}
              className={toggleClass}
            />
          </div>

          <div className={rowClass}>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Member joined organization</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get notified when a new member joins your organization
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailOnMemberJoined}
              onChange={() => handleChange('emailOnMemberJoined')}
              className={toggleClass}
            />
          </div>

          <div className={rowClass}>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Weekly digest</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive a weekly summary of your team's activity
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailDigest}
              onChange={() => handleChange('emailDigest')}
              className={toggleClass}
            />
          </div>
        </div>
      </Card>

      {/* Push Notifications */}
      <Card className="p-8 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md">
        <h2 className="text-lg font-bold mb-6">Push notifications</h2>

        <div className={rowClass}>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Enable push notifications</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Receive push notifications on your browser and devices
            </p>
          </div>
          <input
            type="checkbox"
            checked={preferences.pushNotifications}
            onChange={() => handleChange('pushNotifications')}
            className={toggleClass}
          />
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save preferences'
          )}
        </Button>
      </div>
    </div>
  );
}
