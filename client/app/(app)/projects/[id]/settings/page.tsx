'use client';

import { useState } from 'react';
import { useFormatDate } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetProject } from '@/lib/hooks';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Loader, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  params: {
    id: string;
  };
  searchParams?: {
    tab?: string;
  };
}

const PRIORITY_OPTIONS = ['low', 'medium', 'high'];
const STATUS_OPTIONS = ['todo', 'in_progress', 'in_review', 'completed'];

export default function ProjectSettingsPage({ params, searchParams }: Props) {
  const formatDate = useFormatDate();
  const router = useRouter();
  const activeTab = searchParams?.tab || 'details';
  const { data: project, isLoading, refetch } = useGetProject(params.id);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    assignee: '',
  });

  // Member invite form state
  const [memberForm, setMemberForm] = useState({
    email: '',
    role: 'member',
  });

  const projectData = project as any;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.createTask(
        params.id,
        taskForm.title,
        taskForm.description,
        taskForm.priority,
        taskForm.status,
        taskForm.dueDate || undefined,
        taskForm.assignee || undefined
      );
      toast.success('Task created successfully!');
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        assignee: '',
      });
      setShowTaskForm(false);
      refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create task';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.email.trim()) {
      toast.error('Email is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.inviteMember(params.id, memberForm.email, memberForm.role);
      toast.success('Member invited successfully!');
      setMemberForm({ email: '', role: 'member' });
      setShowMemberForm(false);
      refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to invite member';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await apiClient.removeMember(params.id, memberId);
      toast.success('Member removed successfully!');
      refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove member';
      toast.error(message);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    try {
      await apiClient.deleteProject(params.id);
      toast.success('Project deleted successfully!');
      router.push('/projects');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete project';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Project not found</p>
        <Link href="/projects">
          <Button variant="outline">Back to projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/projects/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Project Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <Link href={`/projects/${params.id}/settings`}>
          <button
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'details' || !activeTab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Details
          </button>
        </Link>
        <Link href={`/projects/${params.id}/settings?tab=members`}>
          <button
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'members'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Team Members
          </button>
        </Link>
        <Link href={`/projects/${params.id}/settings?tab=tasks`}>
          <button
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'tasks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Tasks
          </button>
        </Link>
      </div>

      {/* Details Tab */}
      {(activeTab === 'details' || !activeTab) && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-6">Project Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-lg font-semibold">{projectData.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-700">{projectData.description || 'No description'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  projectData.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {projectData.status === 'active' ? 'Active' : 'Archived'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-gray-600">{formatDate(projectData.createdAt)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-red-200 bg-red-50">
            <h2 className="text-lg font-bold text-red-900 mb-6">Danger Zone</h2>
            <p className="text-sm text-red-800 mb-4">
              Deleting this project will permanently remove all associated data. This action cannot be undone.
            </p>
            <Button
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={handleDeleteProject}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Project
            </Button>
          </Card>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Team Members</h2>
            <Button
              onClick={() => setShowMemberForm(!showMemberForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </div>

          {/* Invite Form */}
          {showMemberForm && (
            <Card className="p-6 bg-blue-50 border-blue-200">
              <form onSubmit={handleInviteMember} className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      type="email"
                      placeholder="member@example.com"
                      value={memberForm.email}
                      onChange={(e) =>
                        setMemberForm({ ...memberForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={memberForm.role}
                      onChange={(e) =>
                        setMemberForm({ ...memberForm, role: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? 'Inviting...' : 'Invite'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMemberForm(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          )}

          {/* Members List */}
          <Card className="p-6">
            {projectData.members && projectData.members.length > 0 ? (
              <div className="space-y-3">
                {(projectData.members as any[]).map((member: any) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-500 rounded-full text-white text-sm flex items-center justify-center font-bold">
                        {member.userId?.firstName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.userId?.firstName} {member.userId?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{member.userId?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium capitalize">
                        {member.role}
                      </span>
                      {member.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveMember(member._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No team members yet</p>
            )}
          </Card>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Create Task</h2>
            <Button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>

          {/* Task Form */}
          {showTaskForm && (
            <Card className="p-6 bg-blue-50 border-blue-200">
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <Input
                    type="text"
                    placeholder="Task title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    placeholder="Task description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={taskForm.status}
                      onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <Input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTaskForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Tasks are managed on the board</p>
              <Link href={`/projects/${params.id}/board`}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Go to Board
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
