'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useGetMyTasks } from '@/lib/hooks';
import { useRealtimeTasks } from '@/lib/socket-hooks-enhanced';
import { useSocket } from '@/lib/socket-context';
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
      return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30';
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30';
    case 'medium':
      return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30';
    case 'low':
      return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/30';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-500/15 dark:text-gray-300 dark:border-gray-500/30';
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

const TaskCard = ({ task, formatDate }: { task: any; formatDate: (date: string | Date) => string }) => (
  <Link href={`/tasks/${task._id}`}>
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
              {formatDate(task.dueDate)}
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

const KanbanColumn = ({ title, tasks, color, formatDate }: { status?: string; title: string; tasks: any[]; color: string; formatDate: (date: string | Date) => string }) => (
  <div className="flex-1 min-w-[300px]">
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100/80 dark:bg-white/10 px-2 py-0.5 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>
    </div>
    <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto pr-2 pb-4">
      {tasks.length > 0 ? (
        tasks.map((task) => <TaskCard key={task._id} task={task} formatDate={formatDate} />)
      ) : (
        <Card className="p-8 text-center border-2 border-dashed border-gray-200/70 dark:border-white/10 bg-gray-50/80 dark:bg-white/5 backdrop-blur-xl">
          <CheckSquare className="w-8 h-8 text-gray-300 dark:text-gray-500 mx-auto mb-2" />
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
  const { isConnected } = useSocket();
  const { data: tasks, isLoading } = useGetMyTasks();
  const realtimeTasks = useRealtimeTasks();
  const t = useT();
  const formatDate = useFormatDate();
  const inputClass = 'pl-11 h-11 bg-white/80 dark:bg-white/5 border-gray-200/60 dark:border-white/10';


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
        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]' : 'bg-amber-500 animate-pulse'
              }`}
            />
            {isConnected ? 'Live updates' : currentOrganization ? 'Connecting' : 'Paused'}
          </div>
          <Link href="/tasks/new">
            <Button className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-lg hover:-translate-y-0.5 text-white shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Search, Filter, and View Toggle */}
      <Card className="p-4 backdrop-blur-xl bg-white/80 dark:bg-white/5 border-gray-200/60 dark:border-white/10 shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="search"
              placeholder={t('tasks.title') + '...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} text-base`}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-gray-100/80 dark:bg-white/5 p-1 rounded-xl border border-gray-200/60 dark:border-white/10">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className={viewMode === 'kanban' ? 'bg-white dark:bg-white/10 shadow-sm' : ''}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-white dark:bg-white/10 shadow-sm' : ''}
            >
              <LayoutList className="w-4 h-4 mr-2" />
              List
            </Button>
          </div>
        </div>

        {/* Priority Filters */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200/60 dark:border-white/10">
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
                    : 'hover:bg-gray-100 dark:hover:bg-white/5'
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
        viewMode === 'kanban' ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[...Array(4)].map((_, colIdx) => (
              <div key={colIdx} className="flex-1 min-w-[300px]">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-200" />
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, idx) => (
                    <Card key={idx} className="p-4 h-28 animate-pulse">
                      <div className="h-4 w-24 rounded bg-gray-100" />
                      <div className="mt-3 h-3 w-3/4 rounded bg-gray-100" />
                      <div className="mt-6 h-3 w-1/2 rounded bg-gray-100" />
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {[...Array(6)].map((_, idx) => (
              <Card key={idx} className="p-5 animate-pulse">
                <div className="h-4 w-1/3 rounded bg-gray-100" />
                <div className="mt-3 h-3 w-2/3 rounded bg-gray-100" />
                <div className="mt-4 h-3 w-1/2 rounded bg-gray-100" />
              </Card>
            ))}
          </div>
        )
      ) : filteredTasks && filteredTasks.length > 0 ? (
        viewMode === 'kanban' ? (
          /* Kanban View */
          <div className="flex gap-6 overflow-x-auto pb-4">
            <KanbanColumn
              status="todo"
              title={t('tasks.pending')}
              tasks={tasksByStatus.todo}
              color="bg-gray-400"
              formatDate={formatDate}
            />
            <KanbanColumn
              status="in_progress"
              title={t('tasks.title')}
              tasks={tasksByStatus.in_progress}
              color="bg-blue-600"
              formatDate={formatDate}
            />
            <KanbanColumn
              status="review"
              title={t('common.edit')}
              tasks={tasksByStatus.review}
              color="bg-amber-500"
              formatDate={formatDate}
            />
            <KanbanColumn
              status="done"
              title={t('tasks.completed')}
              tasks={tasksByStatus.done}
              color="bg-green-600"
              formatDate={formatDate}
            />
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredTasks.map((task: any) => (
              <Link key={task._id} href={`/tasks/${task._id}`}>
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
              ? 'Try adjusting filters or clearing search.'
              : 'Create your first task to kick off realtime tracking.'}
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
