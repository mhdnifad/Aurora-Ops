import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import Task from '../models/Task';
import Comment from '../models/Comment';
import Project from '../models/Project';
// import User from '../models/User';
import AuditLog from '../models/AuditLog';
import { asyncHandler, paginationMeta, getClientIp } from '../utils/helpers';
import { AuthorizationError, NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import { PermissionChecker } from '../permissions/checker';
import { createTaskSchema, updateTaskSchema, createCommentSchema } from '../validations/task.validation';
import cloudinaryService from '../services/cloudinary.service';
import SocketManager from '../socket';
import fs from 'fs/promises';
import path from 'path';

/**
 * Create task
 */
export const createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { projectId, title, description, priority, status, dueDate } = req.body;
  let { assigneeId } = req.body;
  const organizationId = req.organizationId!;

  // Filter out empty strings for assigneeId
  if (assigneeId === '' || assigneeId === null || assigneeId === undefined) {
    assigneeId = undefined;
  }

  // Validate request
  const validation = createTaskSchema.safeParse({
    projectId,
    title,
    description,
    priority,
    status,
    dueDate,
    assigneeId,
  });
  if (!validation.success) {
    throw new ValidationError('Invalid task data');
  }

  // Check if project exists and belongs to organization
  const project = await Project.findOne({
    _id: projectId,
    organizationId,
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check permissions
  const canCreate = await PermissionChecker.userHasPermission(
    req.user!._id,
    organizationId,
    'create_task'
  );

  if (!canCreate) {
    throw new AuthorizationError('You do not have permission to create tasks');
  }

  // Create task
  const taskData: Partial<typeof Task.prototype> = {
    projectId,
    organizationId,
    title,
    description,
    priority,
    status,
    dueDate,
    createdBy: req.user!._id,
  };

  // Only include assigneeId if it's provided
  if (assigneeId) {
    taskData.assigneeId = assigneeId;
  }

  const task = await Task.create(taskData);

  // Log audit
  await AuditLog.create({
    userId: req.user!._id,
    organizationId,
    action: 'create_task',
    entityType: 'Task',
    entityId: task._id,
    metadata: { title: task.title },
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'] || 'unknown',
  });

  logger.info(`Task created: ${task.title}`);

  const populatedTask = await task.populate(['assigneeId', 'createdBy', 'projectId']);
  const socketManager = SocketManager.getInstance();
  socketManager?.broadcastTaskUpdate(populatedTask as any, 'created');
  socketManager?.emitOrgEvent(organizationId, 'task:created', { task: populatedTask });

  res.status(201).json({
    success: true,
    data: populatedTask,
  });
});

/**
 * Get tasks for project
 */
export const getProjectTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params;
  const { page = 1, limit = 50, status, priority, assignee, assigneeId } = req.query;
  const organizationId = req.organizationId!;

  // Build filter
  const filter: Record<string, unknown> = {
    projectId,
    organizationId,
    deletedAt: null,
  };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assigneeId || assignee) filter.assigneeId = assigneeId || assignee;

  // Check if project exists
  const project = await Project.findOne({
    _id: projectId,
    organizationId,
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Get tasks
  const tasks = await Task.find(filter)
    .populate('assigneeId', 'firstName lastName avatar email')
    .populate('createdBy', 'firstName lastName')
    .populate('projectId', 'name')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: -1 });

  const total = await Task.countDocuments(filter);

  res.json({
    success: true,
    data: tasks,
    pagination: paginationMeta(total, Number(page), Number(limit)),
  });
});

/**
 * Get all tasks for user
 */
export const getMyTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 50, status, priority } = req.query;
  const organizationId = req.organizationId!;

  // Build filter
  const filter: Record<string, unknown> = {
    organizationId,
    assigneeId: req.user!._id,
    deletedAt: null,
  };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  // Get tasks
  const tasks = await Task.find(filter)
    .populate('projectId', 'name slug')
    .populate('createdBy', 'firstName lastName')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ dueDate: 1 });

  const total = await Task.countDocuments(filter);

  res.json({
    success: true,
    data: tasks,
    pagination: paginationMeta(total, Number(page), Number(limit)),
  });
});

/**
 * Get task by ID
 */
export const getTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const organizationId = req.organizationId!;

  const task = await Task.findOne({
    _id: id,
    organizationId,
    deletedAt: null,
  }).populate(['projectId', 'assigneeId', 'createdBy']);

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  res.json({
    success: true,
    data: task,
  });
});

/**
 * Update task
 */
export const updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, priority, status, dueDate, assigneeId } = req.body;
  const organizationId = req.organizationId!;

  // Validate request
  const validation = updateTaskSchema.safeParse({
    title,
    description,
    priority,
    status,
    dueDate,
    assigneeId,
  });
  if (!validation.success) {
    throw new ValidationError('Invalid task data');
  }

  const task = await Task.findOne({
    _id: id,
    organizationId,
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  // Check permissions
  const canUpdate = await PermissionChecker.userHasPermission(
    req.user!._id,
    organizationId,
    'update_task'
  );

  if (!canUpdate) {
    throw new AuthorizationError('You do not have permission to update tasks');
  }

  // Update task
  const updatedTask = await Task.findByIdAndUpdate(
    id,
    {
      title,
      description,
      priority,
      status,
      dueDate,
      assigneeId,
      updatedBy: req.user!._id,
    },
    { new: true, runValidators: true }
  );

  // Log audit
  await AuditLog.create({
    userId: req.user!._id,
    organizationId,
    action: 'update_task',
    entityType: 'Task',
    entityId: task._id,
    changes: {
      title,
      priority,
      status,
      dueDate,
      assigneeId,
    },
    metadata: { title: task.title },
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'] || 'unknown',
  });

  logger.info(`Task updated: ${task.title}`);

  const populatedUpdatedTask = await updatedTask?.populate(['assigneeId', 'createdBy', 'projectId']);
  const socketManager = SocketManager.getInstance();
  if (populatedUpdatedTask) {
    socketManager?.broadcastTaskUpdate(populatedUpdatedTask as any, 'updated');
    socketManager?.emitOrgEvent(organizationId, 'task:updated', { task: populatedUpdatedTask });
  }

  res.json({
    success: true,
    data: populatedUpdatedTask,
  });
});

/**
 * Delete task
 */
export const deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const organizationId = req.organizationId!;

  const task = await Task.findOne({
    _id: id,
    organizationId,
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  // Check permissions
  const canDelete = await PermissionChecker.userHasPermission(
    req.user!._id,
    organizationId,
    'delete_task'
  );

  if (!canDelete) {
    throw new AuthorizationError('You do not have permission to delete tasks');
  }

  // Soft delete
  task.deletedAt = new Date();
  await task.save();

  // Log audit
  await AuditLog.create({
    userId: req.user!._id,
    organizationId,
    action: 'delete_task',
    entityType: 'Task',
    entityId: task._id,
    metadata: { title: task.title },
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'] || 'unknown',
  });

  logger.info(`Task deleted: ${task.title}`);

  const socketManager = SocketManager.getInstance();
  socketManager?.broadcastTaskUpdate({
    assigneeId: task.assigneeId,
    taskId: task._id,
    projectId: task.projectId,
  } as any, 'deleted');
  socketManager?.emitOrgEvent(organizationId, 'task:deleted', {
    taskId: task._id,
    projectId: task.projectId,
  });

  res.json({
    success: true,
    message: 'Task deleted',
  });
});

/**
 * Create comment on task
 */
export const createComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  const organizationId = req.organizationId!;

  // Validate request
  const validation = createCommentSchema.safeParse({ content });
  if (!validation.success) {
    throw new ValidationError('Invalid comment data');
  }

  const task = await Task.findOne({
    _id: id,
    organizationId,
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  // Create comment
  const comment = await Comment.create({
    organizationId,
    taskId: id,
    content,
    userId: req.user!._id,
  });

  // Log audit
  await AuditLog.create({
    userId: req.user!._id,
    organizationId,
    action: 'create_comment',
    entityType: 'Comment',
    entityId: comment._id,
    metadata: { taskId: task._id },
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'] || 'unknown',
  });

  logger.info(`Comment created on task: ${task.title}`);

  const populatedComment = await comment.populate('createdBy', 'firstName lastName avatar');
  const socketManager = SocketManager.getInstance();
  socketManager?.emitOrgEvent(organizationId, 'comment:created', {
    comment: populatedComment,
    taskId: id,
  });

  res.status(201).json({
    success: true,
    data: populatedComment,
  });
});

/**
 * Get task comments
 */
export const getTaskComments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const organizationId = req.organizationId!;

  const task = await Task.findOne({
    _id: id,
    organizationId,
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  const comments = await Comment.find({ taskId: id, organizationId, deletedAt: null })
    .populate('createdBy', 'firstName lastName avatar email')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: 1 });

  const total = await Comment.countDocuments({ taskId: id, organizationId, deletedAt: null });

  res.json({
    success: true,
    data: comments,
    pagination: paginationMeta(total, Number(page), Number(limit)),
  });
});

/**
 * Update comment
 */
export const updateComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const organizationId = req.organizationId!;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  // Check if user is the comment creator
  const commentData = comment as unknown as { userId: { toString: () => string } };
  if (commentData.userId.toString() !== req.user!._id.toString()) {
    throw new AuthorizationError('You can only edit your own comments');
  }

  // Update comment
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
    { new: true, runValidators: true }
  );

  // Log audit
  await AuditLog.create({
    userId: req.user!._id,
    organizationId,
    action: 'update_comment',
    entityType: 'Comment',
    entityId: comment._id,
    metadata: { taskId: comment.taskId },
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'] || 'unknown',
  });

  logger.info(`Comment updated`);

  const populatedUpdatedComment = await updatedComment?.populate('createdBy', 'firstName lastName avatar');
  const socketManager = SocketManager.getInstance();
  if (populatedUpdatedComment) {
    socketManager?.emitOrgEvent(organizationId, 'comment:updated', {
      comment: populatedUpdatedComment,
      taskId: comment.taskId,
    });
  }

  res.json({
    success: true,
    data: populatedUpdatedComment,
  });
});

/**
 * Delete comment
 */
export const deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { commentId } = req.params;
  const organizationId = req.organizationId!;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  // Check if user is the comment creator or has permission
  const canDelete =
    ((comment as unknown as { userId: { toString: () => string } })?.userId.toString() === req.user!._id.toString()) ||
    (await PermissionChecker.userHasPermission(req.user!._id, organizationId, 'delete_task'));

  if (!canDelete) {
    throw new AuthorizationError('You do not have permission to delete this comment');
  }

  // Soft delete
  comment.deletedAt = new Date();
  await comment.save();

  // Log audit
  await AuditLog.create({
    userId: req.user!._id,
    organizationId,
    action: 'delete_comment',
    entityType: 'Comment',
    entityId: comment._id,
    metadata: { taskId: comment.taskId },
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'] || 'unknown',
  });

  logger.info(`Comment deleted`);

  const socketManager = SocketManager.getInstance();
  socketManager?.emitOrgEvent(organizationId, 'comment:deleted', {
    commentId: comment._id,
    taskId: comment.taskId,
  });

  res.json({
    success: true,
    message: 'Comment deleted',
  });
});

/**
 * Upload task attachment
 */
export const uploadAttachment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const organizationId = req.organizationId!;

  if (!req.file) {
    throw new ValidationError('No file provided');
  }

  // Validate attachment file type (allow common documents, images, and archives)
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
  if (!allowedTypes.has(req.file.mimetype)) {
    throw new ValidationError('Unsupported file type for attachments');
  }

  const task = await Task.findOne({ _id: id, organizationId, deletedAt: null });
  if (!task) {
    throw new NotFoundError('Task not found');
  }

  if (!cloudinaryService.isEnabled()) {
    const uploadsRoot = path.join(process.cwd(), 'uploads');
    const taskDir = path.join(uploadsRoot, 'tasks', Array.isArray(id) ? id[0] : id);
    await fs.mkdir(taskDir, { recursive: true });

    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}_${safeName}`;
    const filePath = path.join(taskDir, fileName);
    await fs.writeFile(filePath, req.file.buffer);

    const relativeUrl = `/uploads/tasks/${Array.isArray(id) ? id[0] : id}/${fileName}`;
    task.attachments = task.attachments || [];
    task.attachments.push({
      name: req.file.originalname,
      url: relativeUrl,
      size: req.file.size,
      type: req.file.mimetype,
      publicId: undefined,
      storage: 'local',
      localPath: filePath,
    });
    await task.save();

    res.status(201).json({
      success: true,
      data: { attachments: task.attachments },
    });
    return;
  }

  const result = await cloudinaryService.uploadTaskAttachment(
    req.file.buffer,
    req.file.originalname,
    Array.isArray(id) ? id[0] : id
  );

  task.attachments = task.attachments || [];
  task.attachments.push({
    name: req.file.originalname,
    url: result.url,
    size: result.bytes,
    type: req.file.mimetype,
    publicId: result.publicId,
    storage: 'cloudinary',
    localPath: null,
  });
  await task.save();

  res.status(201).json({
    success: true,
    data: {
      attachments: task.attachments,
    },
  });
});

/**
 * Delete task attachment
 */
export const deleteAttachment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id, attachmentId } = req.params as { id: string; attachmentId: string };
  const organizationId = req.organizationId!;

  const task = await Task.findOne({ _id: id, organizationId, deletedAt: null });
  if (!task) {
    throw new NotFoundError('Task not found');
  }

  // Permission: update_task or delete_task
  const canModify = await PermissionChecker.userHasPermission(req.user!._id, organizationId, 'update_task');
  if (!canModify) {
    throw new AuthorizationError('You do not have permission to modify task attachments');
  }

  const attachment = (task.attachments || []).find((a: { _id?: { toString: () => string } }) => a._id?.toString() === attachmentId);
  if (!attachment) {
    throw new NotFoundError('Attachment not found');
  }

  // Delete from Cloudinary when possible
  if (attachment.publicId && cloudinaryService.isEnabled()) {
    try {
      const resourceType = attachment.type?.startsWith('image/')
        ? 'image'
        : attachment.type?.startsWith('video/')
          ? 'video'
          : 'raw';
      await cloudinaryService.deleteFile(attachment.publicId, resourceType);
    } catch (e) {
      logger.warn('Failed to delete Cloudinary file, continuing to remove from task', { error: e });
    }
  }

  if ((attachment as { localPath?: string })?.localPath) {
    try {
      await fs.unlink((attachment as { localPath?: string }).localPath as string);
    } catch (e) {
      logger.warn('Failed to delete local attachment file', { error: e });
    }
  }

  // Remove from task document
  task.attachments = (task.attachments || []).filter((a: { _id?: { toString: () => string } }) => a._id?.toString() !== attachmentId);
  await task.save();

  res.json({
    success: true,
    data: { attachments: task.attachments },
  });
});

