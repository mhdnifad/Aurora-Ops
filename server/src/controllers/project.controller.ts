import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import Project from '../models/Project';
import Organization from '../models/Organization';
import AuditLog from '../models/AuditLog';
import Task from '../models/Task';
import { asyncHandler, slugify, paginationMeta } from '../utils/helpers';
import { AuthorizationError, NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import { PermissionChecker } from '../permissions/checker';
import { createProjectSchema, updateProjectSchema } from '../validations/project.validation';
import { PROJECT_STATUS } from '../config/constants';
import SocketManager from '../socket';

/**
 * Create project
 */
export const createProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description, icon, color } = req.body;

  // Validate request
  const validation = createProjectSchema.safeParse({ name, description, icon, color });
  if (!validation.success) {
    throw new ValidationError('Invalid project data');
  }

  const organizationId = req.organizationId!;

  // Check if organization exists
  const org = await Organization.findOne({ _id: organizationId, deletedAt: null });
  if (!org) {
    throw new NotFoundError('Organization not found');
  }

  // Check permissions
  const canCreate = await PermissionChecker.userHasPermission(
    req.user!._id,
    organizationId,
    'create_project'
  );

  if (!canCreate) {
    throw new AuthorizationError('You do not have permission to create projects');
  }

  // Create project
  const project = await Project.create({
    name,
    description,
    slug: slugify(name),
    icon,
    color,
    organizationId,
    ownerId: req.user!._id,
  });

  // Log audit
  const fwd = (req.headers['x-forwarded-for'] as string) || '';
  const ip = fwd.split(',')[0].trim() || (req.socket?.remoteAddress as string) || 'unknown';
  const ua = (req.headers['user-agent'] as string) || 'unknown';
  await AuditLog.create({
    userId: req.user!._id,
    organizationId,
    action: 'create_project',
    entityType: 'Project',
    entityId: project._id,
    metadata: { name: project.name },
    ipAddress: ip,
    userAgent: ua,
  });

  logger.info(`Project created: ${project.name}`);

  const socketManager = SocketManager.getInstance();
  socketManager?.emitOrgEvent(organizationId, 'project:created', { project });

  res.status(201).json({
    success: true,
    data: project,
  });
});

/**
 * Get projects for organization
 */
export const getProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, archived = false } = req.query;
  const organizationId = req.organizationId!;
  const statusFilter = archived === 'true' ? PROJECT_STATUS.ARCHIVED : PROJECT_STATUS.ACTIVE;

  const projects = await Project.find({
    organizationId,
    status: statusFilter,
    deletedAt: null,
  })
    .populate('ownerId', 'firstName lastName avatar')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: -1 });

  const total = await Project.countDocuments({
    organizationId,
    status: statusFilter,
    deletedAt: null,
  });

  res.json({
    success: true,
    data: projects,
    pagination: paginationMeta(total, Number(page), Number(limit)),
  });
});

/**
 * Get project by ID
 */
export const getProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const organizationId = req.organizationId!;

  const project = await Project.findOne({
    _id: id,
    organizationId,
    deletedAt: null,
  }).populate('ownerId', 'firstName lastName email avatar');

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  res.json({
    success: true,
    data: project,
  });
});

/**
 * Update project
 */
export const updateProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, icon, color } = req.body;
  const organizationId = req.organizationId!;

  // Validate request
  const validation = updateProjectSchema.safeParse({ name, description, icon, color });
  if (!validation.success) {
    throw new ValidationError('Invalid project data');
  }

  const project = await Project.findOne({
    _id: id,
    organizationId,
    deletedAt: null,
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check permissions
  const canUpdate = await PermissionChecker.userHasPermission(
    req.user!._id,
    organizationId,
    'update_project'
  );

  if (!canUpdate) {
    throw new AuthorizationError('You do not have permission to update projects');
  }

  // Update project
  const updatedProject = await Project.findOneAndUpdate(
    { _id: id, deletedAt: null },
    {
      name,
      description,
      icon,
      color,
      slug: name ? slugify(name) : project.slug,
    },
    { new: true, runValidators: true }
  );

  // Log audit
  const fwd4 = (req.headers['x-forwarded-for'] as string) || '';
  const ip4 = fwd4.split(',')[0].trim() || req.socket?.remoteAddress?.toString() || 'unknown';
  const ua4 = (req.headers['user-agent'] as string) || 'unknown';
  await AuditLog.create({
    userId: req.user!._id,
    organizationId,
    action: 'update_project',
    entityType: 'Project',
    entityId: project._id,
    changes: { name, description, icon, color },
    ipAddress: ip4,
    userAgent: ua4,
  });

  logger.info(`Project updated: ${project.name}`);

  const socketManager = SocketManager.getInstance();
  if (updatedProject) {
    socketManager?.emitOrgEvent(organizationId, 'project:updated', { project: updatedProject });
  }

  res.json({
    success: true,
    data: updatedProject,
  });
});

/**
 * Archive project
 */
export const archiveProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const organizationId = req.organizationId!;

  const project = await Project.findOne({
    _id: id,
    organizationId,
    deletedAt: null,
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check permissions
  const canDelete = await PermissionChecker.userHasPermission(
    req.user!._id,
    organizationId,
    'delete_project'
  );

  if (!canDelete) {
    throw new AuthorizationError('You do not have permission to archive projects');
  }

  // Archive project
  project.status = PROJECT_STATUS.ARCHIVED;
  await project.save();

  // Log audit
  const fwd1 = (req.headers['x-forwarded-for'] as string) || '';
  const ip1 = fwd1.split(',')[0].trim() || (req.socket?.remoteAddress as string) || 'unknown';
  const ua1 = (req.headers['user-agent'] as string) || 'unknown';
  await AuditLog.create({
    userId: req.user!._id,
    organizationId,
    action: 'archive_project',
    entityType: 'Project',
    entityId: project._id,
    metadata: { status: PROJECT_STATUS.ARCHIVED },
    ipAddress: ip1,
    userAgent: ua1,
  });

  logger.info(`Project archived: ${project.name}`);

  const socketManager = SocketManager.getInstance();
  socketManager?.emitOrgEvent(organizationId, 'project:archived', { project });

  res.json({
    success: true,
    message: 'Project archived',
  });
});

/**
 * Unarchive project
 */
export const unarchiveProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const organizationId = req.organizationId!;

  const project = await Project.findOne({
    _id: id,
    organizationId,
    deletedAt: null,
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check permissions
  const canDelete = await PermissionChecker.userHasPermission(
    req.user!._id,
    organizationId,
    'delete_project'
  );

  if (!canDelete) {
    throw new AuthorizationError('You do not have permission to unarchive projects');
  }

  // Unarchive project
  project.status = PROJECT_STATUS.ACTIVE;
  await project.save();

  // Log audit
  const fwd2 = (req.headers['x-forwarded-for'] as string) || '';
  const ip2 = fwd2.split(',')[0].trim() || (req.socket?.remoteAddress as string) || 'unknown';
  const ua2 = (req.headers['user-agent'] as string) || 'unknown';
  await AuditLog.create({
    userId: req.user!._id,
    organizationId,
    action: 'unarchive_project',
    entityType: 'Project',
    entityId: project._id,
    metadata: { status: PROJECT_STATUS.ACTIVE },
    ipAddress: ip2,
    userAgent: ua2,
  });

  logger.info(`Project unarchived: ${project.name}`);

  const socketManager = SocketManager.getInstance();
  socketManager?.emitOrgEvent(organizationId, 'project:unarchived', { project });

  res.json({
    success: true,
    data: project,
  });
});

/**
 * Delete project
 */
export const deleteProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const organizationId = req.organizationId!;

  const project = await Project.findOne({
    _id: id,
    organizationId,
    deletedAt: null,
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check permissions
  const canDelete = await PermissionChecker.userHasPermission(
    req.user!._id,
    organizationId,
    'delete_project'
  );

  if (!canDelete) {
    throw new AuthorizationError('You do not have permission to delete projects');
  }

  // Soft delete
  project.deletedAt = new Date();
  await project.save();

  // Log audit
  const fwd3 = (req.headers['x-forwarded-for'] as string) || '';
  const ip3 = fwd3.split(',')[0].trim() || (req.socket?.remoteAddress as string) || 'unknown';
  const ua3 = (req.headers['user-agent'] as string) || 'unknown';
  await AuditLog.create({
    userId: req.user!._id,
    organizationId,
    action: 'delete_project',
    entityType: 'Project',
    entityId: project._id,
    metadata: { name: project.name },
    ipAddress: ip3,
    userAgent: ua3,
  });

  logger.info(`Project deleted: ${project.name}`);

  const socketManager = SocketManager.getInstance();
  socketManager?.emitOrgEvent(organizationId, 'project:deleted', { projectId: project._id });

  res.json({
    success: true,
    message: 'Project deleted',
  });
});

/**
 * Get project statistics
 */
export const getProjectStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const organizationId = req.organizationId!;

  const project = await Project.findOne({
    _id: id,
    organization: organizationId,
    deletedAt: null,
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Get statistics
  const totalTasks = await Task.countDocuments({
    projectId: id,
    deletedAt: null,
  });

  const completedTasks = await Task.countDocuments({
    projectId: id,
    status: 'done',
    deletedAt: null,
  });

  const inProgressTasks = await Task.countDocuments({
    projectId: id,
    status: 'in_progress',
    deletedAt: null,
  });

  const overdueTasks = await Task.countDocuments({
    projectId: id,
    dueDate: { $lt: new Date() },
    status: { $ne: 'done' },
    deletedAt: null,
  });

  res.json({
    success: true,
    data: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    },
  });
});

/**
 * Invite member to project
 */
export const inviteProjectMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { email, role } = req.body;
  const organizationId = req.organizationId!;

  // Check if project exists
  const project = await Project.findOne({
    _id: id,
    organizationId,
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // In a real app, you'd send an invitation email
  // For now, we'll just add them to the project
  if (!Array.isArray(project.members)) {
    project.members = [];
  }

  // Log the invitation
  const fwd = (req.headers['x-forwarded-for'] as string) || '';
  const ip = fwd.split(',')[0].trim() || (req.socket?.remoteAddress as string) || 'unknown';
  const ua = (req.headers['user-agent'] as string) || 'unknown';
  await AuditLog.create({
    userId: req.user!._id,
    organizationId,
    action: 'invite_project_member',
    entityType: 'Project',
    entityId: project._id,
    metadata: { email, role },
    ipAddress: ip,
    userAgent: ua,
  });

  logger.info(`Member invited to project: ${email}`);

  res.status(201).json({
    success: true,
    message: 'Invitation sent successfully',
  });
});

/**
 * Get project members
 */
export const getProjectMembers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const organizationId = req.organizationId!;

  const project = await Project.findOne({
    _id: id,
    organizationId,
    deletedAt: null,
  }).populate('members', 'firstName lastName email avatar');

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  const members = Array.isArray(project.members) ? project.members : [];
  const total = members.length;
  const start = (Number(page) - 1) * Number(limit);
  const paginatedMembers = members.slice(start, start + Number(limit));

  res.json({
    success: true,
    data: paginatedMembers,
    pagination: paginationMeta(total, Number(page), Number(limit)),
  });
});

/**
 * Remove member from project
 */
export const removeProjectMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id, memberId } = req.params;
  const organizationId = req.organizationId!;

  const project = await Project.findOne({
    _id: id,
    organizationId,
    deletedAt: null,
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Remove member from members array
  if (Array.isArray(project.members)) {
    project.members = project.members.filter(
      (m: { toString: () => string }) => m.toString() !== memberId
    );
    await project.save();
  }

  // Log the removal
  const fwd = (req.headers['x-forwarded-for'] as string) || '';
  const ip = fwd.split(',')[0].trim() || (req.socket?.remoteAddress as string) || 'unknown';
  const ua = (req.headers['user-agent'] as string) || 'unknown';
  await AuditLog.create({
    userId: req.user!._id,
    organizationId,
    action: 'remove_project_member',
    entityType: 'Project',
    entityId: project._id,
    metadata: { memberId },
    ipAddress: ip,
    userAgent: ua,
  });

  logger.info(`Member removed from project`);

  res.json({
    success: true,
    message: 'Member removed successfully',
  });
});

