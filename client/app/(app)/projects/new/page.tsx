'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useOrganization } from '@/lib/organization-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Loader } from 'lucide-react';

export default function NewProjectPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    key: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { currentOrganization } = useOrganization();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'name' && !formData.key) {
      setFormData((prev) => ({
        ...prev,
        key: value
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .substring(0, 5),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    if (!formData.key.trim()) {
      setError('Project key is required');
      return;
    }

    if (!currentOrganization) {
      setError('Organization not selected');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.createProject(
        formData.name,
        formData.description,
        'folder',
        '#3b82f6',
        currentOrganization?._id
      );
      
      toast.success('Project created successfully!');
      // Redirect to project detail page
      router.push(`/projects/${(response as any)._id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create project';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create new project</h1>
          <p className="text-gray-600 mt-1">Set up a project to organize and track work</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Project name *</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Website Redesign"
              disabled={isLoading}
              required
              className="text-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Give your project a clear, descriptive name
            </p>
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What is this project about?"
              disabled={isLoading}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Help your team understand what this project is for
            </p>
          </div>

          {/* Project Key */}
          <div>
            <label className="block text-sm font-medium mb-2">Project key *</label>
            <Input
              type="text"
              name="key"
              value={formData.key}
              onChange={handleChange}
              placeholder="WR"
              disabled={isLoading}
              required
              maxLength={5}
              className="uppercase font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Unique identifier for this project (max 5 characters)
            </p>
          </div>

          {/* Organization Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              Organization: <span className="font-medium">{currentOrganization?.name}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <Link href="/projects" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create project'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
