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
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/settings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Notification settings</h1>
          <p className="text-gray-600 mt-1">Choose how you receive notifications</p>
        </div>
      </div>

      {/* Email Notifications */}
      <Card className="p-8">
        <h2 className="text-lg font-bold mb-6">Email notifications</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Task assigned to you</p>
              <p className="text-sm text-gray-600">
                Get notified when a task is assigned to you
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailOnTaskAssigned}
              onChange={() => handleChange('emailOnTaskAssigned')}
              className="rounded w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
            <div>
              <p className="font-medium">New comments on tasks</p>
              <p className="text-sm text-gray-600">
                Get notified when someone comments on your tasks
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailOnTaskComment}
              onChange={() => handleChange('emailOnTaskComment')}
              className="rounded w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Project invitations</p>
              <p className="text-sm text-gray-600">
                Get notified when you're invited to projects
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailOnProjectInvite}
              onChange={() => handleChange('emailOnProjectInvite')}
              className="rounded w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Member joined organization</p>
              <p className="text-sm text-gray-600">
                Get notified when a new member joins your organization
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailOnMemberJoined}
              onChange={() => handleChange('emailOnMemberJoined')}
              className="rounded w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Weekly digest</p>
              <p className="text-sm text-gray-600">
                Receive a weekly summary of your team's activity
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailDigest}
              onChange={() => handleChange('emailDigest')}
              className="rounded w-5 h-5"
            />
          </div>
        </div>
      </Card>

      {/* Push Notifications */}
      <Card className="p-8">
        <h2 className="text-lg font-bold mb-6">Push notifications</h2>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
          <div>
            <p className="font-medium">Enable push notifications</p>
            <p className="text-sm text-gray-600">
              Receive push notifications on your browser and devices
            </p>
          </div>
          <input
            type="checkbox"
            checked={preferences.pushNotifications}
            onChange={() => handleChange('pushNotifications')}
            className="rounded w-5 h-5"
          />
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
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
