
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useGetProjects, useCreateTask } from '@/lib/hooks';
import { useOrganization } from '@/lib/organization-context';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Loader, AlertCircle } from 'lucide-react';

function NewTaskPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentOrganization, organizations, isLoading: orgLoading } = useOrganization();
  const { mutateAsync: createTask, isPending } = useCreateTask();
  const [error, setError] = useState('');
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useGetProjects(1, 100, false);
  const projectsList = Array.isArray(projects) ? projects : [];
  const userId = (user as any)?._id ?? user?.id ?? '';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    projectId: projectsList.length > 0 ? projectsList[0]._id : '',
    dueDate: '',
    assigneeId: userId,
  });

  useEffect(() => {
    if (!userId) return;
    setFormData((prev) => (prev.assigneeId ? prev : { ...prev, assigneeId: userId }));
  }, [userId]);

  if (!orgLoading && (!currentOrganization || organizations.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-4">No Organization Found</h2>
        <p className="text-gray-600 mb-6">
          You must create or join an organization to create tasks.
        </p>
        <a href="/organizations/new">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            Create Organization
          </Button>
        </a>
      </div>
    );
  }

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Set default projectId when projects load
  useEffect(() => {
    if (projectsList.length > 0 && !formData.projectId) {
      setFormData((prev) => ({ ...prev, projectId: projectsList[0]._id }));
    }
  }, [projectsList]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      };
      await createTask(payload);
      router.push('/tasks');
    } catch (err: any) {
      setError(err?.message || 'Failed to create task. Please try again.');
    }
  };

  return (
    <div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Project</label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                disabled={isPending || projectsLoading}
                required
              >
                {projectsList.map((project: any) => (
                  <option key={project._id} value={project._id}>{project.name}</option>
                ))}
              </select>
            </div>
            {/* Assignee */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Assignee</label>
              <Input
                type="text"
                name="assigneeId"
                value={formData.assigneeId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
                disabled={isPending}
                required
              />
            </div>
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
                disabled={isPending}
                required
              />
            </div>
            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
                disabled={isPending}
                rows={3}
                required
              />
            </div>
            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                disabled={isPending}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                disabled={isPending}
                required
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            {/* Due Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
              <Input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
                disabled={isPending}
              />
            </div>
          </div>
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 mt-4">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/tasks')}
              className="border-gray-300 hover:bg-gray-100 px-6"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 shadow-lg"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default NewTaskPage;
