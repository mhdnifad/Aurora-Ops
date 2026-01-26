"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttachment = exports.uploadAttachment = exports.deleteComment = exports.updateComment = exports.getTaskComments = exports.createComment = exports.deleteTask = exports.updateTask = exports.getTask = exports.getMyTasks = exports.getProjectTasks = exports.createTask = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const Comment_1 = __importDefault(require("../models/Comment"));
const Project_1 = __importDefault(require("../models/Project"));
// import User from '../models/User';
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const helpers_1 = require("../utils/helpers");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const checker_1 = require("../permissions/checker");
const task_validation_1 = require("../validations/task.validation");
const cloudinary_service_1 = __importDefault(require("../services/cloudinary.service"));
/**
 * Create task
 */
exports.createTask = (0, helpers_1.asyncHandler)(async (req, res) => {
    let { projectId, title, description, priority, status, dueDate, assigneeId } = req.body;
    const organizationId = req.organizationId;
    // Filter out empty strings for assigneeId
    if (assigneeId === '' || assigneeId === null || assigneeId === undefined) {
        assigneeId = undefined;
    }
    // Validate request
    const validation = task_validation_1.createTaskSchema.safeParse({
        projectId,
        title,
        description,
        priority,
        status,
        dueDate,
        assigneeId,
    });
    if (!validation.success) {
        throw new errors_1.ValidationError('Invalid task data');
    }
    // Check if project exists and belongs to organization
    const project = await Project_1.default.findOne({
        _id: projectId,
        organizationId,
    });
    if (!project) {
        throw new errors_1.NotFoundError('Project not found');
    }
    // Check permissions
    const canCreate = await checker_1.PermissionChecker.userHasPermission(req.user._id, organizationId, 'create_task');
    if (!canCreate) {
        throw new errors_1.AuthorizationError('You do not have permission to create tasks');
    }
    // Create task
    const taskData = {
        projectId,
        organizationId,
        title,
        description,
        priority,
        status,
        dueDate,
        createdBy: req.user._id,
    };
    // Only include assigneeId if it's provided
    if (assigneeId) {
        taskData.assigneeId = assigneeId;
    }
    const task = await Task_1.default.create(taskData);
    // Log audit
    await AuditLog_1.default.create({
        userId: req.user._id,
        organizationId,
        action: 'create_task',
        entityType: 'Task',
        entityId: task._id,
        metadata: { title: task.title },
        ipAddress: (0, helpers_1.getClientIp)(req),
        userAgent: req.headers['user-agent'] || 'unknown',
    });
    logger_1.default.info(`Task created: ${task.title}`);
    res.status(201).json({
        success: true,
        data: await task.populate(['assigneeId', 'createdBy', 'projectId']),
    });
});
/**
 * Get tasks for project
 */
exports.getProjectTasks = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { projectId } = req.params;
    const { page = 1, limit = 50, status, priority, assignee, assigneeId } = req.query;
    const organizationId = req.organizationId;
    // Build filter
    const filter = {
        projectId,
        organizationId,
        deletedAt: null,
    };
    if (status)
        filter.status = status;
    if (priority)
        filter.priority = priority;
    if (assigneeId || assignee)
        filter.assigneeId = assigneeId || assignee;
    // Check if project exists
    const project = await Project_1.default.findOne({
        _id: projectId,
        organizationId,
    });
    if (!project) {
        throw new errors_1.NotFoundError('Project not found');
    }
    // Get tasks
    const tasks = await Task_1.default.find(filter)
        .populate('assigneeId', 'firstName lastName avatar email')
        .populate('createdBy', 'firstName lastName')
        .populate('projectId', 'name')
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .sort({ createdAt: -1 });
    const total = await Task_1.default.countDocuments(filter);
    res.json({
        success: true,
        data: tasks,
        pagination: (0, helpers_1.paginationMeta)(total, Number(page), Number(limit)),
    });
});
/**
 * Get all tasks for user
 */
exports.getMyTasks = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 50, status, priority } = req.query;
    const organizationId = req.organizationId;
    // Build filter
    const filter = {
        organizationId,
        assigneeId: req.user._id,
        deletedAt: null,
    };
    if (status)
        filter.status = status;
    if (priority)
        filter.priority = priority;
    // Get tasks
    const tasks = await Task_1.default.find(filter)
        .populate('projectId', 'name slug')
        .populate('createdBy', 'firstName lastName')
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .sort({ dueDate: 1 });
    const total = await Task_1.default.countDocuments(filter);
    res.json({
        success: true,
        data: tasks,
        pagination: (0, helpers_1.paginationMeta)(total, Number(page), Number(limit)),
    });
});
/**
 * Get task by ID
 */
exports.getTask = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const organizationId = req.organizationId;
    const task = await Task_1.default.findOne({
        _id: id,
        organizationId,
        deletedAt: null,
    }).populate(['projectId', 'assigneeId', 'createdBy']);
    if (!task) {
        throw new errors_1.NotFoundError('Task not found');
    }
    res.json({
        success: true,
        data: task,
    });
});
/**
 * Update task
 */
exports.updateTask = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { title, description, priority, status, dueDate, assigneeId } = req.body;
    const organizationId = req.organizationId;
    // Validate request
    const validation = task_validation_1.updateTaskSchema.safeParse({
        title,
        description,
        priority,
        status,
        dueDate,
        assigneeId,
    });
    if (!validation.success) {
        throw new errors_1.ValidationError('Invalid task data');
    }
    const task = await Task_1.default.findOne({
        _id: id,
        organizationId,
    });
    if (!task) {
        throw new errors_1.NotFoundError('Task not found');
    }
    // Check permissions
    const canUpdate = await checker_1.PermissionChecker.userHasPermission(req.user._id, organizationId, 'update_task');
    if (!canUpdate) {
        throw new errors_1.AuthorizationError('You do not have permission to update tasks');
    }
    // Update task
    const updatedTask = await Task_1.default.findByIdAndUpdate(id, {
        title,
        description,
        priority,
        status,
        dueDate,
        assigneeId,
        updatedBy: req.user._id,
    }, { new: true, runValidators: true });
    // Log audit
    await AuditLog_1.default.create({
        userId: req.user._id,
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
        ipAddress: (0, helpers_1.getClientIp)(req),
        userAgent: req.headers['user-agent'] || 'unknown',
    });
    logger_1.default.info(`Task updated: ${task.title}`);
    res.json({
        success: true,
        data: await updatedTask?.populate(['assigneeId', 'createdBy', 'projectId']),
    });
});
/**
 * Delete task
 */
exports.deleteTask = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const organizationId = req.organizationId;
    const task = await Task_1.default.findOne({
        _id: id,
        organizationId,
    });
    if (!task) {
        throw new errors_1.NotFoundError('Task not found');
    }
    // Check permissions
    const canDelete = await checker_1.PermissionChecker.userHasPermission(req.user._id, organizationId, 'delete_task');
    if (!canDelete) {
        throw new errors_1.AuthorizationError('You do not have permission to delete tasks');
    }
    // Soft delete
    task.deletedAt = new Date();
    await task.save();
    // Log audit
    await AuditLog_1.default.create({
        userId: req.user._id,
        organizationId,
        action: 'delete_task',
        entityType: 'Task',
        entityId: task._id,
        metadata: { title: task.title },
        ipAddress: (0, helpers_1.getClientIp)(req),
        userAgent: req.headers['user-agent'] || 'unknown',
    });
    logger_1.default.info(`Task deleted: ${task.title}`);
    res.json({
        success: true,
        message: 'Task deleted',
    });
});
/**
 * Create comment on task
 */
exports.createComment = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const organizationId = req.organizationId;
    // Validate request
    const validation = task_validation_1.createCommentSchema.safeParse({ content });
    if (!validation.success) {
        throw new errors_1.ValidationError('Invalid comment data');
    }
    const task = await Task_1.default.findOne({
        _id: id,
        organizationId,
    });
    if (!task) {
        throw new errors_1.NotFoundError('Task not found');
    }
    // Create comment
    const comment = await Comment_1.default.create({
        taskId: id,
        content,
        userId: req.user._id,
    });
    // Log audit
    await AuditLog_1.default.create({
        userId: req.user._id,
        organizationId,
        action: 'create_comment',
        entityType: 'Comment',
        entityId: comment._id,
        metadata: { taskId: task._id },
        ipAddress: (0, helpers_1.getClientIp)(req),
        userAgent: req.headers['user-agent'] || 'unknown',
    });
    logger_1.default.info(`Comment created on task: ${task.title}`);
    res.status(201).json({
        success: true,
        data: await comment.populate('createdBy', 'firstName lastName avatar'),
    });
});
/**
 * Get task comments
 */
exports.getTaskComments = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const organizationId = req.organizationId;
    const task = await Task_1.default.findOne({
        _id: id,
        organizationId,
    });
    if (!task) {
        throw new errors_1.NotFoundError('Task not found');
    }
    const comments = await Comment_1.default.find({ task: id, deletedAt: null })
        .populate('createdBy', 'firstName lastName avatar email')
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .sort({ createdAt: 1 });
    const total = await Comment_1.default.countDocuments({ task: id, deletedAt: null });
    res.json({
        success: true,
        data: comments,
        pagination: (0, helpers_1.paginationMeta)(total, Number(page), Number(limit)),
    });
});
/**
 * Update comment
 */
exports.updateComment = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id: _id, commentId } = req.params;
    const { content } = req.body;
    const organizationId = req.organizationId;
    const comment = await Comment_1.default.findById(commentId);
    if (!comment) {
        throw new errors_1.NotFoundError('Comment not found');
    }
    // Check if user is the comment creator
    if (comment?.createdBy.toString() !== req.user._id.toString()) {
        throw new errors_1.AuthorizationError('You can only edit your own comments');
    }
    // Update comment
    const updatedComment = await Comment_1.default.findByIdAndUpdate(commentId, { content }, { new: true, runValidators: true });
    // Log audit
    await AuditLog_1.default.create({
        userId: req.user._id,
        organizationId,
        action: 'update_comment',
        entityType: 'Comment',
        entityId: comment._id,
        metadata: { taskId: comment.taskId },
        ipAddress: (0, helpers_1.getClientIp)(req),
        userAgent: req.headers['user-agent'] || 'unknown',
    });
    logger_1.default.info(`Comment updated`);
    res.json({
        success: true,
        data: await updatedComment?.populate('createdBy', 'firstName lastName avatar'),
    });
});
/**
 * Delete comment
 */
exports.deleteComment = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id: _id, commentId } = req.params;
    const organizationId = req.organizationId;
    const comment = await Comment_1.default.findById(commentId);
    if (!comment) {
        throw new errors_1.NotFoundError('Comment not found');
    }
    // Check if user is the comment creator or has permission
    const canDelete = comment?.createdBy.toString() === req.user._id.toString() ||
        (await checker_1.PermissionChecker.userHasPermission(req.user._id, organizationId, 'delete_task'));
    if (!canDelete) {
        throw new errors_1.AuthorizationError('You do not have permission to delete this comment');
    }
    // Soft delete
    comment.deletedAt = new Date();
    await comment.save();
    // Log audit
    await AuditLog_1.default.create({
        userId: req.user._id,
        organizationId,
        action: 'delete_comment',
        entityType: 'Comment',
        entityId: comment._id,
        metadata: { taskId: comment.taskId },
        ipAddress: (0, helpers_1.getClientIp)(req),
        userAgent: req.headers['user-agent'] || 'unknown',
    });
    logger_1.default.info(`Comment deleted`);
    res.json({
        success: true,
        message: 'Comment deleted',
    });
});
/**
 * Upload task attachment
 */
exports.uploadAttachment = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const organizationId = req.organizationId;
    if (!req.file) {
        throw new errors_1.ValidationError('No file provided');
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
        throw new errors_1.ValidationError('Unsupported file type for attachments');
    }
    const task = await Task_1.default.findOne({ _id: id, organizationId, deletedAt: null });
    if (!task) {
        throw new errors_1.NotFoundError('Task not found');
    }
    if (!cloudinary_service_1.default.isEnabled()) {
        throw new errors_1.ValidationError('File uploads are currently disabled');
    }
    const result = await cloudinary_service_1.default.uploadTaskAttachment(req.file.buffer, req.file.originalname, Array.isArray(id) ? id[0] : id);
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
exports.deleteAttachment = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id, attachmentId } = req.params;
    const organizationId = req.organizationId;
    const task = await Task_1.default.findOne({ _id: id, organizationId, deletedAt: null });
    if (!task) {
        throw new errors_1.NotFoundError('Task not found');
    }
    // Permission: update_task or delete_task
    const canModify = await checker_1.PermissionChecker.userHasPermission(req.user._id, organizationId, 'update_task');
    if (!canModify) {
        throw new errors_1.AuthorizationError('You do not have permission to modify task attachments');
    }
    const attachment = (task.attachments || []).find((a) => a._id?.toString() === attachmentId);
    if (!attachment) {
        throw new errors_1.NotFoundError('Attachment not found');
    }
    // Delete from Cloudinary when possible
    if (attachment.publicId && cloudinary_service_1.default.isEnabled()) {
        try {
            await cloudinary_service_1.default.deleteFile(attachment.publicId, 'auto');
        }
        catch (e) {
            logger_1.default.warn('Failed to delete Cloudinary file, continuing to remove from task', { error: e });
        }
    }
    // Remove from task document
    task.attachments = (task.attachments || []).filter((a) => a._id?.toString() !== attachmentId);
    await task.save();
    res.json({
        success: true,
        data: { attachments: task.attachments },
    });
});
//# sourceMappingURL=task.controller.js.map