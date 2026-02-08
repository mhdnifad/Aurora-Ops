"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { useFormatDate } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useGetTask, useUpdateTask, useDeleteTask, useCreateComment, useGetTaskComments } from '@/lib/hooks';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Loader, AlertCircle, Trash2, Save, MessageCircle, Clock, User, Flag, Paperclip, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useOrganization } from '@/lib/organization-context';
import { useTypingPresence } from '@/lib/socket-hooks-enhanced';

export default function TaskDetailPage() {
  const formatDate = useFormatDate();
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const { currentOrganization, isLoading: orgLoading } = useOrganization();
  const inputClass = 'h-11 bg-white/80 dark:bg-white/5 border-gray-200/60 dark:border-white/10';

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [uploadsEnabled, setUploadsEnabled] = useState(true);

  // Only fetch task if org is loaded and set
  const enabled = !!currentOrganization?._id;
  const { data: task, isLoading: taskLoading, refetch: refetchTask } = useGetTask(taskId, { enabled });
  const { data: comments, isLoading: commentsLoading, refetch: refetchComments } = useGetTaskComments(taskId, 1, 50, { enabled });
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const typingTimeoutRef = useRef<number | null>(null);

  const projectId = useMemo(() => {
    return (task as any)?.projectId?._id || (task as any)?.projectId || '';
  }, [task]);
  const { typingUsers, emitTyping, emitStopTyping } = useTypingPresence(taskId, projectId);

  const [editData, setEditData] = useState({
    title: (task as any)?.title || '',
    description: (task as any)?.description || '',
    status: (task as any)?.status || 'todo',
    priority: (task as any)?.priority || 'medium',
    dueDate: (task as any)?.dueDate ? new Date((task as any).dueDate).toISOString().split('T')[0] : '',
  });

  useEffect(() => {
    if (task) {
      setEditData({
        title: (task as any).title,
        description: (task as any).description,
        status: (task as any).status,
        priority: (task as any).priority,
        dueDate: (task as any).dueDate ? new Date((task as any).dueDate).toISOString().split('T')[0] : '',
      });
    }
  }, [task]);

  useEffect(() => {
    let isActive = true;
    apiClient
      .getPlatformStatus()
      .then((status) => {
        if (!isActive) return;
        const enabled = !!status?.uploads?.enabled;
        setUploadsEnabled(enabled);
      })
      .catch(() => {
        if (isActive) setUploadsEnabled(true);
      });
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      emitStopTyping();
    };
  }, [emitStopTyping]);

  const handleUpdate = async () => {
    try {
      setError('');
      if (!editData.title.trim()) {
        setError('Title is required');
        return;
      }

      await updateTaskMutation.mutateAsync({
        id: taskId,
        ...editData,
        dueDate: editData.dueDate ? new Date(editData.dueDate).toISOString() : null,
      });

      setIsEditing(false);
      refetchTask();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTaskMutation.mutateAsync(taskId);
      router.push('/tasks');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await apiClient.createComment(taskId, commentText);
      setCommentText('');
      emitStopTyping();
      refetchComments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (orgLoading || !currentOrganization) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-500 dark:text-gray-400">Loading organization...</span>
      </div>
    );
  }

  if (taskLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 rounded bg-gray-100/80 dark:bg-gray-800/60 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md animate-pulse lg:col-span-2">
            <div className="h-4 w-40 rounded bg-gray-100/80 dark:bg-gray-800/60" />
            <div className="mt-4 h-24 rounded bg-gray-100/80 dark:bg-gray-800/60" />
          </Card>
          <Card className="p-4 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md animate-pulse">
            <div className="h-4 w-24 rounded bg-gray-100/80 dark:bg-gray-800/60" />
            <div className="mt-4 h-4 w-32 rounded bg-gray-100/80 dark:bg-gray-800/60" />
          </Card>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Task not found</p>
        <Link href="/tasks">
          <Button className="mt-4">Back to Tasks</Button>
        </Link>
      </div>
    );
  }

  const commentsList = Array.isArray(comments) ? comments : [];
  const attachmentsList = Array.isArray((task as any)?.attachments) ? (task as any).attachments : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tasks">
            <Button variant="outline" size="sm" className="border-gray-200/70 dark:border-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{(task as any)?.title}</h1>
            {(task as any)?.projectId?.name && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{(task as any)?.projectId?.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Realtime comments
          </div>
          {!isEditing && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="border-gray-200/70 dark:border-white/10"
              >
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteTaskMutation.isPending}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <Card className="p-6 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Title</label>
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    placeholder="Task title"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <Textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    placeholder="Task description"
                    rows={5}
                    className="bg-white/80 dark:bg-white/5 border-gray-200/60 dark:border-white/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200/60 dark:border-white/10 rounded-lg bg-white/80 dark:bg-white/5"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                    <select
                      value={editData.priority}
                      onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200/60 dark:border-white/10 rounded-lg bg-white/80 dark:bg-white/5"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                  <Input
                    type="date"
                    value={editData.dueDate}
                    onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="flex gap-2 pt-4 border-t border-white/20 dark:border-white/10">
                  <Button onClick={handleUpdate} disabled={updateTaskMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {(task as any)?.description && (
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{(task as any)?.description}</p>
                  </div>
                )}

                {/* Attachments */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Paperclip className="w-5 h-5" />
                    Attachments ({attachmentsList.length})
                  </h3>
                  {attachmentsList.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No attachments yet</p>
                  ) : (
                    <ul className="space-y-2">
                      {attachmentsList.map((att: any) => (
                        <li key={att._id || att.url} className="flex items-center justify-between p-2 bg-white/70 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded">
                          <div className="flex items-center gap-2">
                            <Paperclip className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <a href={att.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                              {att.name}
                            </a>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round((att.size || 0) / 1024)} KB</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                const confirmed = window.confirm('Delete this attachment?');
                                if (!confirmed) return;
                                try {
                                  await apiClient.deleteTaskAttachment(taskId, att._id);
                                  toast.success('Attachment deleted');
                                  await refetchTask();
                                } catch (err: any) {
                                  const msg = err?.response?.data?.message || 'Failed to delete attachment';
                                  setError(msg);
                                  toast.error(msg);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex flex-col">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
                        onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                        className="text-sm"
                        disabled={!uploadsEnabled}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {uploadsEnabled
                          ? 'Max 10MB. Allowed: JPG, PNG, WEBP, GIF, PDF, DOC/DOCX, XLS/XLSX, CSV, TXT, ZIP'
                          : 'File uploads are currently disabled.'}
                      </p>
                    </div>
                    <Button
                      disabled={!uploadsEnabled || !attachmentFile || isUploadingAttachment}
                      onClick={async () => {
                        if (!uploadsEnabled) return;
                        if (!attachmentFile) return;
                        if (attachmentFile.size > 10 * 1024 * 1024) {
                          const msg = 'File too large (max 10MB)';
                          setError(msg);
                          toast.error(msg);
                          return;
                        }
                        const allowedTypes = new Set([
                          'image/jpeg',
                          'image/png',
                          'image/webp',
                          'image/gif',
                          'application/pdf',
                          'text/plain',
                          'text/csv',
                          'application/zip',
                          'application/msword',
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'application/vnd.ms-excel',
                          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        ]);
                        if (!allowedTypes.has(attachmentFile.type)) {
                          const msg = 'Unsupported file type for attachments';
                          setError(msg);
                          toast.error(msg);
                          return;
                        }
                        setIsUploadingAttachment(true);
                        try {
                          await apiClient.uploadTaskAttachment(taskId, attachmentFile);
                          setAttachmentFile(null);
                          await refetchTask();
                        } catch (err: any) {
                          const msg = err?.response?.data?.message || 'Failed to upload attachment';
                          setError(msg);
                          toast.error(msg);
                        } finally {
                          setIsUploadingAttachment(false);
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isUploadingAttachment ? (
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Comments Section */}
          <Card className="p-6 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Comments ({commentsList.length})
            </h3>

            <form onSubmit={handleAddComment} className="mb-6">
              <Textarea
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                  emitTyping();
                  if (typingTimeoutRef.current) {
                    window.clearTimeout(typingTimeoutRef.current);
                  }
                  typingTimeoutRef.current = window.setTimeout(() => {
                    emitStopTyping();
                  }, 1200);
                }}
                placeholder="Add a comment..."
                rows={3}
                disabled={isSubmittingComment}
                className="bg-white/80 dark:bg-white/5 border-gray-200/60 dark:border-white/10"
              />
              {typingUsers.length > 0 && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {typingUsers.length === 1 ? 'Someone is typing...' : `${typingUsers.length} people are typing...`}
                </p>
              )}
              <Button
                type="submit"
                disabled={!commentText.trim() || isSubmittingComment}
                className="mt-2"
              >
                {isSubmittingComment ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                Post Comment
              </Button>
            </form>

            <div className="space-y-4">
              {commentsLoading ? (
                <div className="text-center py-4">
                  <Loader className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                </div>
              ) : commentsList.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No comments yet</p>
              ) : (
                commentsList.map((comment: any) => (
                  <div key={comment._id} className="p-4 bg-white/80 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100/80 dark:bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-300">
                          {comment.createdBy?.firstName?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">
                            {comment.createdBy?.firstName} {comment.createdBy?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="p-4 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-md">
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Details</h4>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</p>
                <div className="mt-1">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      (task as any)?.status === 'done'
                        ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300'
                        : (task as any)?.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                        : (task as any)?.status === 'review'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300'
                    }`}
                  >
                    {(task as any)?.status === 'in_progress' ? 'In Progress' : (task as any)?.status.charAt(0).toUpperCase() + (task as any)?.status.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  Priority
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 capitalize">{(task as any)?.priority}</p>
              </div>

              {(task as any)?.dueDate && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Due Date
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {formatDate((task as any).dueDate)}
                  </p>
                </div>
              )}

              {(task as any)?.assigneeId && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Assigned To
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {(task as any)?.assigneeId?.firstName} {(task as any)?.assigneeId?.lastName}
                  </p>
                </div>
              )}

              {(task as any)?.projectId && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Project</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{(task as any)?.projectId?.name}</p>
                </div>
              )}

              <div className="pt-2 border-t border-white/20 dark:border-white/10">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Created {formatDate((task as any)?.createdAt)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
