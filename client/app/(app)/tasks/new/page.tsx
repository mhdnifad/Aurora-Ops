
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
import { ArrowLeft, Loader, AlertCircle, Sparkles, Calendar, Flag, Clipboard, User } from 'lucide-react';

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
      <div className="relative overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/40 dark:from-gray-900/80 dark:via-slate-900/60 dark:to-indigo-950/40 p-10 shadow-xl">
        <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="relative text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-4 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="h-4 w-4" />
            Workspace setup required
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create an organization first</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">Tasks belong to an organization. Create one to unlock projects, tasks, and realtime updates.</p>
          <a href="/organizations/new" className="mt-6 inline-block">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
              Create Organization
            </Button>
          </a>
        </div>
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
    <div className="relative space-y-8">
      <div className="absolute -top-24 right-6 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute top-40 -left-10 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 rounded-3xl border border-white/20 dark:border-white/10 bg-gradient-to-r from-white via-blue-50/40 to-indigo-50/40 dark:from-gray-900/80 dark:via-slate-900/60 dark:to-indigo-950/40 p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
              New task workspace
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create a task that ships</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Tie every task to a project, set priority, and track it in realtime.</p>
          </div>
          <Link href="/tasks">
            <Button variant="outline" className="border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Button>
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-white/10 px-3 py-1">
            <Clipboard className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            Organization: <span className="font-semibold text-gray-900 dark:text-white">{currentOrganization?.name}</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-white/10 px-3 py-1">
            <User className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
            Assigned to: <span className="font-semibold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</span>
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        <Card className="p-8 shadow-xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Title</label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-gray-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
                disabled={isPending}
                placeholder="e.g. Finalize onboarding flow"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-gray-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
                disabled={isPending}
                rows={5}
                placeholder="Add context, links, acceptance criteria, and anything the team needs."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Project</label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-gray-200/70 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 dark:bg-white/5"
                disabled={isPending || projectsLoading || projectsList.length === 0}
                required
              >
                {projectsList.length === 0 ? (
                  <option value="">No projects available</option>
                ) : (
                  projectsList.map((project: any) => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))
                )}
              </select>
              {projectsError && (
                <p className="mt-2 text-xs text-red-600">Unable to load projects. Refresh and try again.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Assignee</label>
              <Input
                type="text"
                value={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Unassigned'}
                className="w-full px-4 py-2.5 border-gray-200/70 dark:border-white/10 bg-gray-50/80 dark:bg-white/5 text-gray-700 dark:text-gray-200 rounded-lg"
                disabled
              />
              <input type="hidden" id="assigneeId" name="assigneeId" value={formData.assigneeId} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-gray-200/70 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 dark:bg-white/5"
                disabled={isPending}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-gray-200/70 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 dark:bg-white/5"
                disabled={isPending}
                required
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
              <Input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-gray-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
                disabled={isPending}
              />
            </div>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-700 dark:text-red-300">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-4 border-t border-gray-200/70 dark:border-white/10 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/tasks')}
              className="border-gray-200/70 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 px-6"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 shadow-lg"
              disabled={isPending || projectsList.length === 0}
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
        </Card>

        <div className="space-y-6">
          <Card className="p-6 shadow-lg border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Flag className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              Task readiness checklist
            </div>
            <ul className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                Clear title with one actionable outcome.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                Description includes acceptance criteria.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                Priority aligned with sprint goals.
              </li>
            </ul>
          </Card>

          <Card className="p-6 shadow-lg border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
              Smart scheduling
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Add a due date to surface this task in dashboards, alerts, and realtime feeds.
            </p>
            <div className="mt-4 rounded-xl border border-indigo-100/60 dark:border-indigo-500/20 bg-indigo-50/80 dark:bg-indigo-500/10 px-4 py-3 text-xs text-indigo-700 dark:text-indigo-300">
              Tip: Set a due date if the task is tied to a client milestone.
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}

export default NewTaskPage;
