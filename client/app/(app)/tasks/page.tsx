'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useGetMyTasks } from '@/lib/hooks';
import { useRealtimeTasks } from '@/lib/socket-hooks-enhanced';
import { useFormatDate } from '@/lib/utils';
import { useT } from '@/lib/useT';
import { useOrganization } from '@/lib/organization-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BackButton } from '@/components/ui/back-button';
import {
  CheckSquare,
  Plus,
  Search,
  Loader,
  LayoutGrid,
  LayoutList,
  Calendar,
  User,
  Clock,
  Flag,
  Filter,
} from 'lucide-react';


type FilterOption = 'all' | 'urgent' | 'high' | 'medium' | 'low';
type ViewMode = 'kanban' | 'list';

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'medium':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'low':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getPriorityIcon = (priority: string) => {
  const className = "w-4 h-4";
  switch (priority) {
    case 'urgent':
      return <Flag className={`${className} text-rose-600`} />;
    case 'high':
      return <Flag className={`${className} text-red-600`} />;
    case 'medium':
      return <Flag className={`${className} text-orange-600`} />;
    case 'low':
      return <Flag className={`${className} text-green-600`} />;
    default:
      return <Flag className={`${className} text-gray-600`} />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'done':
    case 'completed':
      return 'bg-green-600 border-green-700';
    case 'in_progress':
      return 'bg-blue-600 border-blue-700';
    case 'review':
      return 'bg-amber-500 border-amber-600';
    case 'todo':
      return 'bg-gray-400 border-gray-500';
    default:
      return 'bg-gray-400 border-gray-500';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'todo':
      return 'To Do';
    case 'in_progress':
      return 'In Progress';
    case 'review':
      return 'Review';
    case 'done':
    case 'completed':
      return 'Done';
    default:
      return status;
  }
};

const TaskCard = ({ task }: { task: any }) => (
  <Link href={`/projects/${task.projectId?._id}/tasks/${task._id}`}>
    <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-blue-300 bg-white group">
      <div className="space-y-3">
        {/* Priority Badge */}
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
            {getPriorityIcon(task.priority)}
            {task.priority}
          </span>
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${
              new Date(task.dueDate) < new Date() ? 'text-red-600 font-semibold' : 'text-gray-500'
            }`}>
              <Clock className="w-3 h-3" />
              {typeof formatDate === 'function' ? formatDate(task.dueDate) : ''}
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className="truncate max-w-[120px]">{task.projectId?.name || 'No project'}</span>
          </div>
          {task.assignedTo && (
            <div
              className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full text-white text-xs flex items-center justify-center font-bold shadow-sm"
              title={`${task.assignedTo?.firstName} ${task.assignedTo?.lastName}`}
            >
              {task.assignedTo?.firstName?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </Card>
  </Link>
);

const KanbanColumn = ({ status, title, tasks, color }: { status: string; title: string; tasks: any[]; color: string }) => (
  <div className="flex-1 min-w-[300px]">
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <h3 className="font-bold text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>
    </div>
    <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto pr-2 pb-4">
      {tasks.length > 0 ? (
        tasks.map((task) => <TaskCard key={task._id} task={task} />)
      ) : (
        <Card className="p-8 text-center border-2 border-dashed border-gray-200 bg-gray-50">
          <CheckSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No {title.toLowerCase()} tasks</p>
        </Card>
      )}
    </div>
  </div>
);

export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const { currentOrganization, organizations, isLoading: orgLoading } = useOrganization();
  const { data: tasks, isLoading } = useGetMyTasks();
  const realtimeTasks = useRealtimeTasks();
  const t = useT();
  const formatDate = useFormatDate();


  // If no organization context, show a friendly message
  if (!orgLoading && (!currentOrganization || organizations.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-4">{t('organization.no_org_title') || 'No Organization Found'}</h2>
        <p className="text-gray-600 mb-6">
          {t('organization.no_org_message') || 'You must create or join an organization to manage tasks.'}
        </p>
        <a href="/organizations/new">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            {t('organization.create_org') || 'Create Organization'}
          </Button>
        </a>
      </div>
    );
  }

  // Prefer realtime updates when available; fall back to queried data
  const taskList = useMemo(() => {
    if (Array.isArray(realtimeTasks) && realtimeTasks.length > 0) return realtimeTasks;
    return Array.isArray(tasks) ? tasks : [];
  }, [realtimeTasks, tasks]);

  const filteredTasks = taskList
    ? (taskList as any[]).filter((task) => {
        const matchesSearch =
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter !== 'all') {
          return matchesSearch && task.priority === filter;
        }
        return matchesSearch;
      })
    : [];

  const showLoading = isLoading && (!Array.isArray(realtimeTasks) || realtimeTasks.length === 0);

  // Group tasks by status for Kanban view
  const tasksByStatus = {
    todo: filteredTasks.filter((t: any) => t.status === 'todo'),
    in_progress: filteredTasks.filter((t: any) => t.status === 'in_progress'),
    review: filteredTasks.filter((t: any) => t.status === 'review'),
    done: filteredTasks.filter((t: any) => t.status === 'done' || t.status === 'completed'),
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton href="/dashboard" label={t('nav.dashboard')} />

      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('tasks.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            {t('tasks.create')}
          </p>
        </div>
        <Link href="/tasks/new">
          <Button className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-lg hover:-translate-y-0.5 text-white shadow-lg">
            <Plus className="w-5 h-5 mr-2" />
            New Task
          </Button>
        </Link>
      </div>

      {/* Search, Filter, and View Toggle */}
      <Card className="p-4 backdrop-blur-xl bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="search"
              placeholder={t('tasks.title') + '...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 text-base"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className={viewMode === 'kanban' ? 'bg-white shadow-sm' : ''}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-white shadow-sm' : ''}
            >
              <LayoutList className="w-4 h-4 mr-2" />
              List
            </Button>
          </div>
        </div>

        {/* Priority Filters */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 mr-2">{t('common.edit')}</span>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'urgent', 'high', 'medium', 'low'] as FilterOption[]).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className={`capitalize ${
                  filter === f
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {f === 'all' ? t('tasks.title') : f}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Content Area */}
      {showLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-500">Loading your tasks...</p>
        </div>
      ) : filteredTasks && filteredTasks.length > 0 ? (
        viewMode === 'kanban' ? (
          /* Kanban View */
          <div className="flex gap-6 overflow-x-auto pb-4">
            <KanbanColumn
              status="todo"
              title={t('tasks.pending')}
              tasks={tasksByStatus.todo}
              color="bg-gray-400"
            />
            <KanbanColumn
              status="in_progress"
              title={t('tasks.title')}
              tasks={tasksByStatus.in_progress}
              color="bg-blue-600"
            />
            <KanbanColumn
              status="review"
              title={t('common.edit')}
              tasks={tasksByStatus.review}
              color="bg-amber-500"
            />
            <KanbanColumn
              status="done"
              title={t('tasks.completed')}
              tasks={tasksByStatus.done}
              color="bg-green-600"
            />
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredTasks.map((task: any) => (
              <Link key={task._id} href={`/projects/${task.projectId?._id}/tasks/${task._id}`}>
                <Card className="p-5 hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-blue-300">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={task.status === 'done' || task.status === 'completed'}
                      onChange={() => {}}
                      className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-blue-600"
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold text-base ${
                              task.status === 'completed'
                                ? 'line-through text-gray-400'
                                : 'text-gray-900'
                            }`}
                          >
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {task.projectId?.name || 'No project'}
                            </span>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(task.createdAt)}
                            </span>
                            {task.dueDate && (
                              <>
                                <span className="text-xs text-gray-300">•</span>
                                <span className={`text-xs flex items-center gap-1 ${
                                  new Date(task.dueDate) < new Date() ? 'text-red-600 font-semibold' : 'text-gray-500'
                                }`}>
                                  <Clock className="w-3 h-3" />
                                  Due {formatDate(task.dueDate)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1 ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {getPriorityIcon(task.priority)}
                            {task.priority}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {getStatusLabel(task.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {task.assignedTo && (
                      <div
                        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full text-white text-sm flex items-center justify-center font-bold shadow-md"
                        title={`${task.assignedTo?.firstName} ${task.assignedTo?.lastName}`}
                      >
                        {task.assignedTo?.firstName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )
      ) : (
        <Card className="p-16 text-center border-2 border-dashed border-gray-200">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <CheckSquare className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {searchTerm || filter !== 'all' ? t('tasks.empty') : t('tasks.create')}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filter !== 'all'
              ? t('common.error')
              : t('tasks.create')}
          </p>
          <Link href="/tasks/new">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="w-5 h-5 mr-2" />
              {t('tasks.create')}
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
