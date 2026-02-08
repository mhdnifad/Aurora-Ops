'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useOrganization } from '@/lib/organization-context';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OrganizationSettingsPage() {
  const queryClient = useQueryClient();
  const { currentOrganization, setCurrentOrganization, organizations } = useOrganization();
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const inputClass = 'h-11 bg-white/80 dark:bg-white/5 border-gray-200/60 dark:border-white/10';

  useEffect(() => {
    if (currentOrganization?._id) {
      setSelectedOrgId(currentOrganization._id);
      loadOrgData(currentOrganization._id);
    } else if (organizations && organizations.length > 0) {
      const orgId = (organizations[0] as any)._id;
      setSelectedOrgId(orgId);
      loadOrgData(orgId);
    }
  }, [currentOrganization, organizations]);

  const loadOrgData = async (orgId: string) => {
    setIsFetching(true);
    try {
      const org = await apiClient.getOrganization(orgId);
      setSelectedOrg(org);
      setFormData({
        name: org.name || '',
        description: org.description || '',
      });
    } catch (err: any) {
      toast.error('Failed to load organization data');
    } finally {
      setIsFetching(false);
    }
  };

  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const orgId = e.target.value;
    setSelectedOrgId(orgId);
    loadOrgData(orgId);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Organization name is required');
      return;
    }

    if (!selectedOrgId) {
      setError('Please select an organization');
      return;
    }

    setIsLoading(true);

    try {
      const updated = await apiClient.updateOrganization(
        selectedOrgId,
        formData.name,
        formData.description
      );
      setSelectedOrg(updated);
      setCurrentOrganization(updated as any);
      
      // Invalidate queries to refresh organization data
      await queryClient.invalidateQueries({ queryKey: ['organization', selectedOrgId] });
      await queryClient.invalidateQueries({ queryKey: ['organizations'] });
      
      toast.success('Organization updated successfully');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update organization';
      setError(message);
      toast.error(message);
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organization settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your organization details</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Workspace profile
        </div>
      </div>

      {/* Form */}
      <Card className="p-8 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Organization *</label>
            <select
              value={selectedOrgId}
              onChange={handleOrgChange}
              disabled={isFetching || isLoading}
              className="w-full px-3 py-2 border border-gray-200/60 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-white/5 dark:text-gray-100"
            >
              <option value="">Select an organization</option>
              {organizations?.map((org: any) => (
                <option key={org._id} value={org._id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          {isFetching ? (
            <div className="space-y-4 py-4">
              <div className="h-11 rounded bg-gray-100/80 dark:bg-gray-800/60 animate-pulse" />
              <div className="h-11 rounded bg-gray-100/80 dark:bg-gray-800/60 animate-pulse" />
              <div className="h-10 w-32 rounded bg-gray-100/80 dark:bg-gray-800/60 animate-pulse" />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Organization name *</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your organization name"
                  autoComplete="off"
                  disabled={isLoading}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
                <Input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Organization description"
                  autoComplete="off"
                  disabled={isLoading}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-gray-200/70 dark:border-white/10">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </Card>
    </div>
  );
}
