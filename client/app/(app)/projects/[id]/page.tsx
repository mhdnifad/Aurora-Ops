'use client';

import { useMemo, useState } from 'react';
import { useFormatDate } from '@/lib/utils';
import Link from 'next/link';
import { useGetProject, useGetProjectStats } from '@/lib/hooks';
import { useRealtimeTasks } from '@/lib/socket-hooks-enhanced';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Users, CheckSquare, Calendar, Loader, MoreVertical } from 'lucide-react';
import { useOrganization } from '@/lib/organization-context';

interface Props {
  params: {
    id: string;
  };
}

export default function ProjectDetailPage({ params }: Props) {
  const formatDate = useFormatDate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentOrganization, isLoading: orgLoading } = useOrganization();
  // Only fetch project if org is loaded and set
  const enabled = !!currentOrganization?._id && !!params.id;
  const { data: project, isLoading } = useGetProject(params.id, { enabled });
  const { data: stats, isLoading: statsLoading } = useGetProjectStats(params.id, { enabled });
  const realtimeTasks = useRealtimeTasks();

  // Derive stats from realtime task stream when available for this project
  const liveStats = useMemo(() => {
    if (!Array.isArray(realtimeTasks) || realtimeTasks.length === 0) return null;
    const tasksForProject = realtimeTasks.filter((t) => t.projectId?._id === params.id || t.projectId === params.id);
    if (tasksForProject.length === 0) return null;

    const totalTasks = tasksForProject.length;
    const completedTasks = tasksForProject.filter((t) => t.status === 'done' || t.status === 'completed').length;
    const inProgressTasks = tasksForProject.filter((t) => t.status === 'in_progress').length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      completionPercentage,
    };
  }, [realtimeTasks, params.id]);
  
  const projectData = project as any;
  const statsData = (liveStats as any) || (stats as any);

  if (orgLoading || !currentOrganization) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading organization...</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!params.id || !projectData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Project not found or invalid project ID.</p>
        <Link href="/projects">
          <Button variant="outline">Back to projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{projectData.name}</h1>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-mono">
                {projectData.key}
              </span>
            </div>
            <p className="text-gray-600 mt-1">{projectData.description}</p>
          </div>
        </div>
        <div className="relative">
          <Button variant="ghost" size="sm" onClick={() => setMenuOpen(!menuOpen)}>
            <MoreVertical className="w-4 h-4" />
          </Button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded shadow-lg z-50">
              <Link href={`/projects/${projectData._id}/settings`} className="block px-4 py-2 text-sm hover:bg-gray-50">
                Settings
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {!statsLoading && statsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total tasks</p>
            <p className="text-2xl font-bold mt-1">{statsData.totalTasks ?? 0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold mt-1">{statsData.completedTasks ?? 0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">In progress</p>
            <p className="text-2xl font-bold mt-1">{statsData.inProgressTasks ?? 0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Completion %</p>
            <p className="text-2xl font-bold mt-1">{statsData.completionPercentage ?? 0}%</p>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tasks and Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Tasks
              </h2>
              <Link href={`/projects/${projectData._id}/board`}>
                <Button size="sm" variant="outline">
                  View board
                </Button>
              </Link>
            </div>

            {statsData && statsData.totalTasks > 0 ? (
              <div className="space-y-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${statsData.completionPercentage}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{statsData.completedTasks} completed</span>
                  <span>{statsData.totalTasks - statsData.completedTasks} remaining</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No tasks yet</p>
            )}

            <Link href={`/projects/${projectData._id}/board`}>
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                Manage tasks
              </Button>
            </Link>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5" />
              Timeline
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Start date</p>
                <p className="font-medium">
                  {projectData.startDate
                    ? formatDate(projectData.startDate)
                    : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End date</p>
                <p className="font-medium">
                  {projectData.endDate
                    ? formatDate(projectData.endDate)
                    : 'Not set'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Team */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Users className="w-5 h-5" />
              Team ({projectData.members?.length || 0})
            </h2>

            {projectData.members && projectData.members.length > 0 ? (
              <div className="space-y-3">
                {projectData.members.map((member: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 bg-blue-500 rounded-full text-white text-sm flex items-center justify-center font-bold">
                        {member.userId?.firstName?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {member.userId?.firstName} {member.userId?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No team members yet</p>
            )}

            <Link href={`/projects/${projectData._id}/settings?tab=members`}>
              <Button variant="outline" className="w-full mt-4">
                Manage team
              </Button>
            </Link>
          </Card>

          {/* Project Info */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Project info</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium capitalize">
                  {projectData.isArchived ? 'Archived' : 'Active'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-medium">
                  {formatDate(projectData.createdAt)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
