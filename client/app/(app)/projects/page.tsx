'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/useT';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useGetProjects } from '@/lib/hooks';
import { useRealtimeProjects } from '@/lib/socket-hooks-enhanced';
import { useSocket } from '@/lib/socket-context';
import { useOrganization } from '@/lib/organization-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BackButton } from '@/components/ui/back-button';
import {
  FolderOpen,
  Plus,
  MoreVertical,
  Search,
  Grid,
  List,
  Archive,
  Loader,
  RefreshCw,
} from 'lucide-react';

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: projects, isLoading, refetch } = useGetProjects();
  const realtimeProjects = useRealtimeProjects();
  const { isConnected } = useSocket();
  const { currentOrganization } = useOrganization();
  const t = useT();
  const inputClass = 'pl-10 h-11 bg-white/80 dark:bg-white/5 border-gray-200/60 dark:border-white/10';

  // Auto-refetch when page becomes visible or route changes
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  useEffect(() => {
    if (currentOrganization?._id) {
      refetch();
    }
  }, [currentOrganization?._id, refetch]);

  const projectList = Array.isArray(realtimeProjects) && realtimeProjects.length > 0
    ? realtimeProjects
    : Array.isArray(projects)
      ? (projects as any[])
      : [];

  const filteredProjects = projectList
    ? projectList.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleArchive = async (projectId: string) => {
    setIsArchiving(projectId);
    try {
      await apiClient.archiveProject(projectId);
      await refetch();
      setMenuOpenId(null);
    } catch (error) {
      // Failed to archive project
    } finally {
      setIsArchiving(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton href="/dashboard" label={t('nav.dashboard')} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{t('projects.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('projects.create')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]' : 'bg-amber-500 animate-pulse'
              }`}
            />
            {isConnected ? 'Live updates' : currentOrganization ? 'Connecting' : 'Paused'}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-gray-600 dark:text-gray-300"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Link href="/projects/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              {t('projects.create')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder={t('projects.title') + '...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex gap-2 bg-gray-100/80 dark:bg-white/5 p-1 rounded-xl border border-gray-200/60 dark:border-white/10">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${
              viewMode === 'grid' ? 'bg-white dark:bg-white/10 shadow text-gray-900 dark:text-white' : 'text-gray-500'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${
              viewMode === 'list' ? 'bg-white dark:bg-white/10 shadow text-gray-900 dark:text-white' : 'text-gray-500'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Projects Display */}
      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <Card key={idx} className="p-6 h-[220px] animate-pulse border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
                <div className="h-12 w-12 rounded-xl bg-gray-100/80 dark:bg-gray-800/60" />
                <div className="mt-6 h-4 w-3/4 rounded bg-gray-100/80 dark:bg-gray-800/60" />
                <div className="mt-3 h-3 w-full rounded bg-gray-100/80 dark:bg-gray-800/60" />
                <div className="mt-8 h-3 w-1/2 rounded bg-gray-100/80 dark:bg-gray-800/60" />
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/80 dark:bg-white/5">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('projects.title')}</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('nav.organizations')}</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('common.success')}</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">{t('common.edit')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-3 w-2/3 rounded bg-gray-100/80 dark:bg-gray-800/60" />
                      <div className="mt-2 h-2 w-1/2 rounded bg-gray-100/80 dark:bg-gray-800/60" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 rounded-full bg-gray-100/80 dark:bg-gray-800/60" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 rounded-full bg-gray-100/80 dark:bg-gray-800/60" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-6 w-6 rounded bg-gray-100/80 dark:bg-gray-800/60 ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )
      ) : filteredProjects && filteredProjects.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link key={project._id} href={`/projects/${project._id}`}>
                <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full relative group border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-xl">
                      <FolderOpen className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div className="relative opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setMenuOpenId(menuOpenId === project._id ? null : project._id);
                        }}
                        className="p-1 hover:bg-gray-100/80 dark:hover:bg-white/10 rounded"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {menuOpenId === project._id && (
                        <div className="absolute right-0 top-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded shadow-lg z-50">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleArchive(project._id);
                            }}
                            disabled={isArchiving === project._id}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50/80 dark:hover:bg-white/10 flex items-center gap-2 disabled:opacity-50"
                          >
                            {isArchiving === project._id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Archive className="w-4 h-4" />
                            )}
                            Archive
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{project.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{project.description}</p>

                  <div className="mt-4 pt-4 border-t border-white/20 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{t('nav.organizations')}</span>
                      <div className="flex -space-x-2">
                        {Array.isArray(project.members) && project.members.slice(0, 3).map((member: any, idx: number) => (
                          <div
                            key={idx}
                            className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white text-xs text-white flex items-center justify-center font-bold"
                            title={member.userId?.firstName}
                          >
                            {member.userId?.firstName?.charAt(0)}
                          </div>
                        ))}
                        {Array.isArray(project.members) && project.members.length > 3 && (
                          <div className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white text-xs text-white flex items-center justify-center font-bold">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{t('common.success')}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        project.isArchived
                          ? 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                      }`}>
                        {project.isArchived ? t('common.cancel') : t('common.success')}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-white/5">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('projects.title')}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('nav.organizations')}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('common.success')}
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('common.edit')}
                    </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-gray-50/80 dark:hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <Link href={`/projects/${project._id}`} className="hover:underline">
                        <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {Array.isArray(project.members) && project.members.slice(0, 3).map((member: any, idx: number) => (
                          <div
                            key={idx}
                            className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white text-xs text-white flex items-center justify-center font-bold"
                            title={member.userId?.firstName}
                          >
                            {member.userId?.firstName?.charAt(0)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        project.isArchived
                          ? 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                      }`}>
                        {project.isArchived ? 'Archived' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === project._id ? null : project._id)}
                        className="p-1 hover:bg-gray-100/80 dark:hover:bg-white/10 rounded"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )
      ) : (
        <Card className="p-12 text-center border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
          <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">{t('projects.empty')}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm ? t('common.error') : t('projects.create')}
          </p>
          {!searchTerm && (
            <Link href="/projects/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                {t('projects.create')}
              </Button>
            </Link>
          )}
        </Card>
      )}
    </div>
  );
}
