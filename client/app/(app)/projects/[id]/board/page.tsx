'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useGetProject, useGetProjectTasks, useUpdateTask } from '@/lib/hooks';
import { useRealtimeTasks } from '@/lib/socket-hooks-enhanced';
import { useSocket } from '@/lib/socket-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus, Loader, Filter } from 'lucide-react';

const STATUS_COLUMNS = {
  todo: { label: 'To Do', color: 'bg-gray-50/80', borderColor: 'border-gray-200/70' },
  in_progress: { label: 'In Progress', color: 'bg-blue-50/80', borderColor: 'border-blue-200/70' },
  review: { label: 'Review', color: 'bg-purple-50/80', borderColor: 'border-purple-200/70' },
  done: { label: 'Done', color: 'bg-green-50/80', borderColor: 'border-green-200/70' },
};

export default function KanbanBoardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const { data: project, isLoading: projectLoading } = useGetProject(projectId);
  const { data: tasks, isLoading: tasksLoading, refetch } = useGetProjectTasks(
    projectId,
    1,
    500,
    {
      status: filterStatus || undefined,
      priority: filterPriority || undefined,
    }
  );
  const realtimeTasks = useRealtimeTasks();
  const { isConnected } = useSocket();
  const updateTaskMutation = useUpdateTask();

  const projectTasks = useMemo(() => {
    if (Array.isArray(realtimeTasks) && realtimeTasks.length > 0) {
      return realtimeTasks.filter(
        (t) => t.projectId?._id === projectId || t.projectId === projectId
      );
    }
    return Array.isArray(tasks) ? tasks : [];
  }, [realtimeTasks, tasks, projectId]);

  // Group tasks by status
  const groupedTasks = {
    todo: projectTasks.filter((t) => t.status === 'todo'),
    in_progress: projectTasks.filter((t) => t.status === 'in_progress'),
    review: projectTasks.filter((t) => t.status === 'review'),
    done: projectTasks.filter((t) => t.status === 'done' || t.status === 'completed'),
  };

  const handleDragStart = (e: React.DragEvent, task: any) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', task._id);
    e.dataTransfer.setData('currentStatus', task.status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const currentStatus = e.dataTransfer.getData('currentStatus');

    if (currentStatus === newStatus) return;

    try {
      const task = projectTasks.find((t) => t._id === taskId);
      if (!task) return;

      await updateTaskMutation.mutateAsync({
        id: taskId,
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      });

      // Realtime stream should update quickly; keep refetch as a fallback
      refetch();
    } catch (error) {
      // Failed to update task status
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-300 bg-red-50';
      case 'high':
        return 'border-orange-300 bg-orange-50';
      case 'medium':
        return 'border-blue-300 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const showLoading = (projectLoading || tasksLoading) && projectTasks.length === 0;

  if (showLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="outline" size="sm" className="border-gray-200/70 dark:border-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{(project as any)?.name} - Board</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Drag and drop tasks to update their status</p>
          </div>
        </div>
        <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]' : 'bg-amber-500 animate-pulse'}`} />
          {isConnected ? 'Live updates' : 'Syncing'}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <div className="flex gap-4 flex-wrap">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200/60 dark:border-white/10 rounded-lg text-sm bg-white/80 dark:bg-white/5"
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-200/60 dark:border-white/10 rounded-lg text-sm bg-white/80 dark:bg-white/5"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterStatus('');
                setFilterPriority('');
              }}
              className="text-sm"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(STATUS_COLUMNS).map(([status, config]: [string, any]) => (
          <div
            key={status}
            className={`${config.color} rounded-2xl border ${config.borderColor} dark:bg-white/5 dark:border-white/10 p-4 min-h-96 backdrop-blur-xl`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">{config.label}</h3>
              <span className="px-2 py-1 bg-gray-200/80 dark:bg-white/10 text-gray-700 dark:text-gray-200 rounded-full text-sm font-semibold">
                {groupedTasks[status as keyof typeof groupedTasks].length}
              </span>
            </div>

            <div className="space-y-3">
              {groupedTasks[status as keyof typeof groupedTasks].map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onClick={() => router.push(`/tasks/${task._id}`)}
                  className={`p-3 bg-white rounded-lg border-l-4 ${getPriorityColor(
                    task.priority
                  )} dark:bg-white/5 border border-white/20 dark:border-white/10 cursor-move hover:shadow-md transition-shadow`}
                >
                  <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">{task.title}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 bg-gray-100/80 dark:bg-white/10 text-gray-700 dark:text-gray-200 rounded capitalize font-semibold">
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {task.assigneeId && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <div className="w-6 h-6 bg-blue-100/80 dark:bg-blue-500/20 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold">
                        {task.assigneeId?.firstName?.[0]}
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {task.assigneeId?.firstName} {task.assigneeId?.lastName}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {groupedTasks[status as keyof typeof groupedTasks].length === 0 && (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                  <p className="text-sm">No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Button - Float */}
      <Link href={`/tasks/new?projectId=${projectId}`}>
        <button className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110">
          <Plus className="w-6 h-6" />
        </button>
      </Link>
    </div>
  );
}
