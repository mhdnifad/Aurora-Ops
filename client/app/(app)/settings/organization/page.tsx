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
          <h1 className="text-3xl font-bold">Organization settings</h1>
          <p className="text-gray-600 mt-1">Manage your organization details</p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
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
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Organization name *</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your organization name"
                  autoComplete="off"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Organization description"
                  autoComplete="off"
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
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
