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

export default function MembersSettingsPage() {
  const router = useRouter();
  const { currentOrganization, organizations } = useOrganization();
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [error, setError] = useState('');

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
      setInviteRole('member');
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
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/settings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Team members</h1>
          <p className="text-gray-600 mt-1">Manage who has access to your organization</p>
        </div>
      </div>

      {/* Invite Section */}
      <Card className="p-8">
        <h2 className="text-lg font-bold mb-4">Invite member</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                disabled={isInviting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isInviting}
            className="bg-blue-600 hover:bg-blue-700"
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
      <Card className="p-8">
        <h2 className="text-lg font-bold mb-4">Members ({Array.isArray(members) ? members.length : 0})</h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : Array.isArray(members) && members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member: any) => (
              <div
                key={member._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-blue-500 rounded-full text-white flex items-center justify-center text-sm font-bold">
                    {member.userId?.firstName?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {member.userId?.firstName} {member.userId?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{member.userId?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium capitalize">
                    {member.role}
                  </span>
                  <button
                    onClick={() => handleRemove(member._id || '')}
                    disabled={isRemoving === member._id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
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
          <p className="text-gray-500 text-center py-8">No members yet</p>
        )}
      </Card>
    </div>
  );
}
