'use client';

import { useAuth } from '@/lib/auth-context';
import { useGetMyTasks, useGetProjects, useGetOrganizations } from '@/lib/hooks';
import { useT } from '@/lib/useT';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckSquare,
  FolderOpen,
  Plus,
  ArrowRight,
  BarChart3,
  Users,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: tasksData, isLoading: tasksLoading } = useGetMyTasks(1, 10);
  const { data: projectsData, isLoading: projectsLoading } = useGetProjects(1, 10);
  const { data: orgsData } = useGetOrganizations(1, 1);
  const t = useT();

  const taskArray = Array.isArray(tasksData) ? tasksData : (tasksData as any)?.tasks || [];
  const projects = Array.isArray(projectsData) ? projectsData : (projectsData as any)?.projects || [];

  const isLoading = authLoading || tasksLoading || projectsLoading;

  // Calculate metrics
  const totalTasks = taskArray.length;
  const completedTasks = taskArray.filter((t: any) => t.status === 'done').length;
  const inProgressTasks = taskArray.filter((t: any) => t.status === 'in_progress' || t.status === 'in-progress').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Header with gradient text */}
      <div className="space-y-3">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {t('dashboard.welcome')}, {user?.firstName}! 👋
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {t('dashboard.overview')}
        </p>
      </div>

      {/* Stats Cards with glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tasks */}
        <Card className="p-6 group hover:shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">{t('tasks.title')}</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mt-3">
                {isLoading ? '—' : totalTasks}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{inProgressTasks}</span> {t('tasks.pending')}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl group-hover:from-blue-500/30 group-hover:to-blue-600/20 transition-all duration-300">
              <CheckSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Completed */}
        <Card className="p-6 group hover:shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">{t('tasks.completed')}</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mt-3">
                {isLoading ? '—' : completedTasks}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                <span className="text-green-600 dark:text-green-400 font-semibold">{completionRate}%</span> {t('tasks.completed')}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl group-hover:from-green-500/30 group-hover:to-green-600/20 transition-all duration-300">
              <BarChart3 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        {/* Projects */}
        <Card className="p-6 group hover:shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">{t('projects.title')}</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mt-3">
                {isLoading ? '—' : projects.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                {t('nav.organizations')}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl group-hover:from-purple-500/30 group-hover:to-purple-600/20 transition-all duration-300">
              <FolderOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        {/* Quick Action */}
        <Card className="p-6 group hover:shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">{t('common.edit')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                {t('tasks.create')} / {t('projects.create')}
              </p>
              <div className="flex gap-2 mt-4">
                <Link href="/tasks/new">
                  <Button size="sm" className="backdrop-blur-sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-2xl group-hover:from-amber-500/30 group-hover:to-amber-600/20 transition-all duration-300">
              <Users className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Tasks */}
      <div className="animate-fadeIn" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('tasks.title')}</h2>
          <Link href="/tasks">
            <Button variant="outline" size="sm" className="group">
              View All
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading tasks...</div>
          ) : taskArray.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">{t('tasks.empty')}</p>
              <Link href="/tasks/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('tasks.create')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {taskArray.slice(0, 5).map((task: any) => (
                <div key={task._id} className="p-4 hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                        task.status === 'done'
                          ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-200/50 dark:border-green-500/30'
                          : task.status === 'in_progress' || task.status === 'in-progress'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/30'
                          : 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-gray-500/30'
                      }`}>
                        {task.status === 'in_progress' || task.status === 'in-progress' ? 'In Progress' : task.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{t('projects.title')}</h2>
          <Link href="/projects">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <Card className="border border-gray-200">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">{t('projects.empty')}</p>
              <Link href="/projects/new">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('projects.create')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {projects.slice(0, 5).map((project: any) => (
                <Link key={project._id} href={`/projects/${project._id}`}>
                  <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                        {project.description && (
                          <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                        )}
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
