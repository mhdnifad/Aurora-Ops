'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/useT';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useGetProjects } from '@/lib/hooks';
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
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: projects, isLoading, refetch } = useGetProjects();
  const t = useT();

  // Auto-refetch when page becomes visible or route changes
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  const filteredProjects = Array.isArray(projects)
    ? (projects as any[]).filter((p) =>
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
      console.error('Failed to archive project:', error);
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-gray-600"
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
            className="pl-10 bg-white"
          />
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${
              viewMode === 'grid' ? 'bg-white shadow' : 'text-gray-500'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${
              viewMode === 'list' ? 'bg-white shadow' : 'text-gray-500'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Projects Display */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredProjects && filteredProjects.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link key={project._id} href={`/projects/${project._id}`}>
                <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full relative group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <FolderOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="relative opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setMenuOpenId(menuOpenId === project._id ? null : project._id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {menuOpenId === project._id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded shadow-lg z-50">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleArchive(project._id);
                            }}
                            disabled={isArchiving === project._id}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
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

                  <h3 className="font-bold text-lg mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>

                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{t('nav.organizations')}</span>
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
                      <span className="text-gray-500">{t('common.success')}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        project.isArchived
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-green-100 text-green-700'
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
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      {t('projects.title')}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      {t('nav.organizations')}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      {t('common.success')}
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                      {t('common.edit')}
                    </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <Link href={`/projects/${project._id}`} className="hover:underline">
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-gray-500">{project.description}</p>
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
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {project.isArchived ? 'Archived' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === project._id ? null : project._id)}
                        className="p-1 hover:bg-gray-100 rounded"
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
        <Card className="p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('projects.empty')}</h3>
          <p className="text-gray-600 mb-6">
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
