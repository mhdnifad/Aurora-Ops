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

/**
 * Create task
 */
export const createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  let { projectId, title, description, priority, status, dueDate, assigneeId } = req.body;
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
  const taskData: any = {
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

  res.status(201).json({
    success: true,
    data: await task.populate(['assigneeId', 'createdBy', 'projectId']),
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
  const filter: any = {
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
  const filter: any = {
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

  res.json({
    success: true,
    data: await updatedTask?.populate(['assigneeId', 'createdBy', 'projectId']),
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

  res.status(201).json({
    success: true,
    data: await comment.populate('createdBy', 'firstName lastName avatar'),
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

  const comments = await Comment.find({ task: id, deletedAt: null })
    .populate('createdBy', 'firstName lastName avatar email')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: 1 });

  const total = await Comment.countDocuments({ task: id, deletedAt: null });

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
  const { id: _id, commentId } = req.params;
  const { content } = req.body;
  const organizationId = req.organizationId!;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  // Check if user is the comment creator
  if ((comment as any)?.createdBy.toString() !== req.user!._id.toString()) {
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

  res.json({
    success: true,
    data: await updatedComment?.populate('createdBy', 'firstName lastName avatar'),
  });
});

/**
 * Delete comment
 */
export const deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id: _id, commentId } = req.params;
  const organizationId = req.organizationId!;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  // Check if user is the comment creator or has permission
  const canDelete =
    (comment as any)?.createdBy.toString() === req.user!._id.toString() ||
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
    throw new ValidationError('File uploads are currently disabled');
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

  const attachment = (task.attachments || []).find((a: any) => a._id?.toString() === attachmentId);
  if (!attachment) {
    throw new NotFoundError('Attachment not found');
  }

  // Delete from Cloudinary when possible
  if (attachment.publicId && cloudinaryService.isEnabled()) {
    try {
      await cloudinaryService.deleteFile(attachment.publicId, 'auto' as any);
    } catch (e) {
      logger.warn('Failed to delete Cloudinary file, continuing to remove from task', { error: e });
    }
  }

  // Remove from task document
  task.attachments = (task.attachments || []).filter((a: any) => a._id?.toString() !== attachmentId);
  await task.save();

  res.json({
    success: true,
    data: { attachments: task.attachments },
  });
});
