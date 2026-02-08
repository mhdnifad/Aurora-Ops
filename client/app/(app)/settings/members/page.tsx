'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useOrganization } from '@/lib/organization-context';
import { useGetOrganizationMembers } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader, ArrowLeft, Plus, X } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  company_admin: 'Company Admin',
  manager: 'Manager',
  employee: 'Employee',
  client: 'Client',
  owner: 'Company Admin',
  admin: 'Company Admin',
  member: 'Employee',
  viewer: 'Client',
  guest: 'Client',
};

export default function MembersSettingsPage() {
  const router = useRouter();
  const { currentOrganization, organizations } = useOrganization();
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('employee');
  const [isInviting, setIsInviting] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const inputClass = 'h-11 bg-white/80 dark:bg-white/5 border-gray-200/60 dark:border-white/10';

  useEffect(() => {
    if (currentOrganization?._id) {
      setSelectedOrgId(currentOrganization._id);
    } else if (organizations && organizations.length > 0) {
      setSelectedOrgId((organizations[0] as any)._id);
    }
  }, [currentOrganization, organizations]);

  const { data: members, isLoading, refetch } = useGetOrganizationMembers(selectedOrgId || '', { enabled: !!selectedOrgId });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!inviteEmail.trim()) {
      setError('Email is required');
      return;
    }


    if (!selectedOrgId) {
      setError('Organization not selected');
      return;
    }

    setIsInviting(true);

    try {
      await apiClient.inviteOrganizationMember(selectedOrgId, inviteEmail, inviteRole);
      setInviteEmail('');
      setInviteRole('employee');
      toast.success('Invitation sent successfully');
      refetch();
    } catch (err: any) {
      let message = err.response?.data?.message || 'Failed to send invitation';
      if (message === 'User not found') {
        message = 'No user with this email exists. Please ask them to register first.';
      }
      setError(message);
      toast.error(message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!selectedOrgId || !confirm('Are you sure you want to remove this member?')) {
      return;
    }

    setIsRemoving(memberId);
    try {
      await apiClient.removeOrganizationMember(selectedOrgId, memberId);
      toast.success('Member removed');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team members</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage who has access to your organization</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Realtime member access
        </div>
      </div>

      {/* Invite Section */}
      <Card className="p-8 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md">
        <h2 className="text-lg font-bold mb-4">Invite member</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleInvite} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Email address</label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                autoComplete="email"
                disabled={isInviting}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                disabled={isInviting}
                className="w-full px-3 py-2 border border-gray-200/60 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-white/5"
              >
                <option value="company_admin">Company Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
                <option value="client">Client (read-only)</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isInviting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isInviting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Send invite
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Members List */}
      <Card className="p-8 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Members ({Array.isArray(members) ? members.length : 0})</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-16 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 animate-pulse" />
            ))}
          </div>
        ) : Array.isArray(members) && members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member: any) => (
              <div
                key={member._id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/80 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-blue-500 rounded-full text-white flex items-center justify-center text-sm font-bold">
                    {member.userId?.firstName?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.userId?.firstName} {member.userId?.lastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.userId?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold capitalize border border-blue-100 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30">
                    {ROLE_LABELS[member.role] || member.role}
                  </span>
                  <button
                    onClick={() => handleRemove(member._id || '')}
                    disabled={isRemoving === member._id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-500/10 rounded transition disabled:opacity-50"
                    title="Remove member"
                  >
                    {isRemoving === member._id ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No members yet</p>
        )}
      </Card>
    </div>
  );
}
