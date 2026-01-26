"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProjectMember = exports.getProjectMembers = exports.inviteProjectMember = exports.getProjectStats = exports.deleteProject = exports.unarchiveProject = exports.archiveProject = exports.updateProject = exports.getProject = exports.getProjects = exports.createProject = void 0;
const Project_1 = __importDefault(require("../models/Project"));
const Organization_1 = __importDefault(require("../models/Organization"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const Task_1 = __importDefault(require("../models/Task"));
const helpers_1 = require("../utils/helpers");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const checker_1 = require("../permissions/checker");
const project_validation_1 = require("../validations/project.validation");
const constants_1 = require("../config/constants");
/**
 * Create project
 */
exports.createProject = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { name, description, icon, color } = req.body;
    // Validate request
    const validation = project_validation_1.createProjectSchema.safeParse({ name, description, icon, color });
    if (!validation.success) {
        throw new errors_1.ValidationError('Invalid project data');
    }
    const organizationId = req.organizationId;
    // Check if organization exists
    const org = await Organization_1.default.findById(organizationId);
    if (!org) {
        throw new errors_1.NotFoundError('Organization not found');
    }
    // Check permissions
    const canCreate = await checker_1.PermissionChecker.userHasPermission(req.user.userId, organizationId, 'create_project');
    if (!canCreate) {
        throw new errors_1.AuthorizationError('You do not have permission to create projects');
    }
    // Create project
    const project = await Project_1.default.create({
        name,
        description,
        slug: (0, helpers_1.slugify)(name),
        icon,
        color,
        organizationId,
        ownerId: req.user.userId,
    });
    // Log audit
    const fwd = req.headers['x-forwarded-for'] || '';
    const ip = fwd.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    await AuditLog_1.default.create({
        userId: req.user.userId,
        organizationId,
        action: 'create_project',
        entityType: 'Project',
        entityId: project._id,
        metadata: { name: project.name },
        ipAddress: ip,
        userAgent: ua,
    });
    logger_1.default.info(`Project created: ${project.name}`);
    res.status(201).json({
        success: true,
        data: project,
    });
});
/**
 * Get projects for organization
 */
exports.getProjects = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 20, archived = false } = req.query;
    const organizationId = req.organizationId;
    const statusFilter = archived === 'true' ? constants_1.PROJECT_STATUS.ARCHIVED : constants_1.PROJECT_STATUS.ACTIVE;
    const projects = await Project_1.default.find({
        organizationId,
        status: statusFilter,
        deletedAt: null,
    })
        .populate('ownerId', 'firstName lastName avatar')
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .sort({ createdAt: -1 });
    const total = await Project_1.default.countDocuments({
        organizationId,
        status: statusFilter,
        deletedAt: null,
    });
    res.json({
        success: true,
        data: projects,
        pagination: (0, helpers_1.paginationMeta)(total, Number(page), Number(limit)),
    });
});
/**
 * Get project by ID
 */
exports.getProject = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const organizationId = req.organizationId;
    const project = await Project_1.default.findOne({
        _id: id,
        organizationId,
        deletedAt: null,
    }).populate('ownerId', 'firstName lastName email avatar');
    if (!project) {
        throw new errors_1.NotFoundError('Project not found');
    }
    res.json({
        success: true,
        data: project,
    });
});
/**
 * Update project
 */
exports.updateProject = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, description, icon, color } = req.body;
    const organizationId = req.organizationId;
    // Validate request
    const validation = project_validation_1.updateProjectSchema.safeParse({ name, description, icon, color });
    if (!validation.success) {
        throw new errors_1.ValidationError('Invalid project data');
    }
    const project = await Project_1.default.findOne({
        _id: id,
        organizationId,
    });
    if (!project) {
        throw new errors_1.NotFoundError('Project not found');
    }
    // Check permissions
    const canUpdate = await checker_1.PermissionChecker.userHasPermission(req.user.userId, organizationId, 'update_project');
    if (!canUpdate) {
        throw new errors_1.AuthorizationError('You do not have permission to update projects');
    }
    // Update project
    const updatedProject = await Project_1.default.findByIdAndUpdate(id, {
        name,
        description,
        icon,
        color,
        slug: name ? (0, helpers_1.slugify)(name) : project?.slug,
    }, { new: true, runValidators: true });
    // Log audit
    const fwd4 = req.headers['x-forwarded-for'] || '';
    const ip4 = fwd4.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
    const ua4 = req.headers['user-agent'] || 'unknown';
    await AuditLog_1.default.create({
        userId: req.user.userId,
        organizationId,
        action: 'update_project',
        entityType: 'Project',
        entityId: project._id,
        changes: { name, description, icon, color },
        ipAddress: ip4,
        userAgent: ua4,
    });
    logger_1.default.info(`Project updated: ${project.name}`);
    res.json({
        success: true,
        data: updatedProject,
    });
});
/**
 * Archive project
 */
exports.archiveProject = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const organizationId = req.organizationId;
    const project = await Project_1.default.findOne({
        _id: id,
        organizationId,
    });
    if (!project) {
        throw new errors_1.NotFoundError('Project not found');
    }
    // Check permissions
    const canDelete = await checker_1.PermissionChecker.userHasPermission(req.user.userId, organizationId, 'delete_project');
    if (!canDelete) {
        throw new errors_1.AuthorizationError('You do not have permission to archive projects');
    }
    // Archive project
    project.status = constants_1.PROJECT_STATUS.ARCHIVED;
    await project.save();
    // Log audit
    const fwd1 = req.headers['x-forwarded-for'] || '';
    const ip1 = fwd1.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
    const ua1 = req.headers['user-agent'] || 'unknown';
    await AuditLog_1.default.create({
        userId: req.user.userId,
        organizationId,
        action: 'archive_project',
        entityType: 'Project',
        entityId: project._id,
        metadata: { status: constants_1.PROJECT_STATUS.ARCHIVED },
        ipAddress: ip1,
        userAgent: ua1,
    });
    logger_1.default.info(`Project archived: ${project.name}`);
    res.json({
        success: true,
        message: 'Project archived',
    });
});
/**
 * Unarchive project
 */
exports.unarchiveProject = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const organizationId = req.organizationId;
    const project = await Project_1.default.findOne({
        _id: id,
        organizationId,
    });
    if (!project) {
        throw new errors_1.NotFoundError('Project not found');
    }
    // Check permissions
    const canDelete = await checker_1.PermissionChecker.userHasPermission(req.user.userId, organizationId, 'delete_project');
    if (!canDelete) {
        throw new errors_1.AuthorizationError('You do not have permission to unarchive projects');
    }
    // Unarchive project
    project.status = constants_1.PROJECT_STATUS.ACTIVE;
    await project.save();
    // Log audit
    const fwd2 = req.headers['x-forwarded-for'] || '';
    const ip2 = fwd2.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
    const ua2 = req.headers['user-agent'] || 'unknown';
    await AuditLog_1.default.create({
        userId: req.user.userId,
        organizationId,
        action: 'unarchive_project',
        entityType: 'Project',
        entityId: project._id,
        metadata: { status: constants_1.PROJECT_STATUS.ACTIVE },
        ipAddress: ip2,
        userAgent: ua2,
    });
    logger_1.default.info(`Project unarchived: ${project.name}`);
    res.json({
        success: true,
        data: project,
    });
});
/**
 * Delete project
 */
exports.deleteProject = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const organizationId = req.organizationId;
    const project = await Project_1.default.findOne({
        _id: id,
        organizationId,
    });
    if (!project) {
        throw new errors_1.NotFoundError('Project not found');
    }
    // Check permissions
    const canDelete = await checker_1.PermissionChecker.userHasPermission(req.user.userId, organizationId, 'delete_project');
    if (!canDelete) {
        throw new errors_1.AuthorizationError('You do not have permission to delete projects');
    }
    // Soft delete
    project.deletedAt = new Date();
    await project.save();
    // Log audit
    const fwd3 = req.headers['x-forwarded-for'] || '';
    const ip3 = fwd3.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
    const ua3 = req.headers['user-agent'] || 'unknown';
    await AuditLog_1.default.create({
        userId: req.user.userId,
        organizationId,
        action: 'delete_project',
        entityType: 'Project',
        entityId: project._id,
        metadata: { name: project.name },
        ipAddress: ip3,
        userAgent: ua3,
    });
    logger_1.default.info(`Project deleted: ${project.name}`);
    res.json({
        success: true,
        message: 'Project deleted',
    });
});
/**
 * Get project statistics
 */
exports.getProjectStats = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const organizationId = req.organizationId;
    const project = await Project_1.default.findOne({
        _id: id,
        organization: organizationId,
    });
    if (!project) {
        throw new errors_1.NotFoundError('Project not found');
    }
    // Get statistics
    const totalTasks = await Task_1.default.countDocuments({
        projectId: id,
        deletedAt: null,
    });
    const completedTasks = await Task_1.default.countDocuments({
        projectId: id,
        status: 'done',
        deletedAt: null,
    });
    const inProgressTasks = await Task_1.default.countDocuments({
        projectId: id,
        status: 'in_progress',
        deletedAt: null,
    });
    const overdueTasks = await Task_1.default.countDocuments({
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
exports.inviteProjectMember = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { email, role } = req.body;
    const organizationId = req.organizationId;
    // Check if project exists
    const project = await Project_1.default.findOne({
        _id: id,
        organizationId,
    });
    if (!project) {
        throw new errors_1.NotFoundError('Project not found');
    }
    // In a real app, you'd send an invitation email
    // For now, we'll just add them to the project
    if (!Array.isArray(project.members)) {
        project.members = [];
    }
    // Log the invitation
    const fwd = req.headers['x-forwarded-for'] || '';
    const ip = fwd.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    await AuditLog_1.default.create({
        userId: req.user.userId,
        organizationId,
        action: 'invite_project_member',
        entityType: 'Project',
        entityId: project._id,
        metadata: { email, role },
        ipAddress: ip,
        userAgent: ua,
    });
    logger_1.default.info(`Member invited to project: ${email}`);
    res.status(201).json({
        success: true,
        message: 'Invitation sent successfully',
    });
});
/**
 * Get project members
 */
exports.getProjectMembers = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const organizationId = req.organizationId;
    const project = await Project_1.default.findOne({
        _id: id,
        organizationId,
    }).populate('members', 'firstName lastName email avatar');
    if (!project) {
        throw new errors_1.NotFoundError('Project not found');
    }
    const members = Array.isArray(project.members) ? project.members : [];
    const total = members.length;
    const start = (Number(page) - 1) * Number(limit);
    const paginatedMembers = members.slice(start, start + Number(limit));
    res.json({
        success: true,
        data: paginatedMembers,
        pagination: (0, helpers_1.paginationMeta)(total, Number(page), Number(limit)),
    });
});
/**
 * Remove member from project
 */
exports.removeProjectMember = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id, memberId } = req.params;
    const organizationId = req.organizationId;
    const project = await Project_1.default.findOne({
        _id: id,
        organizationId,
    });
    if (!project) {
        throw new errors_1.NotFoundError('Project not found');
    }
    // Remove member from members array
    if (Array.isArray(project.members)) {
        project.members = project.members.filter((m) => m.toString() !== memberId);
        await project.save();
    }
    // Log the removal
    const fwd = req.headers['x-forwarded-for'] || '';
    const ip = fwd.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    await AuditLog_1.default.create({
        userId: req.user.userId,
        organizationId,
        action: 'remove_project_member',
        entityType: 'Project',
        entityId: project._id,
        metadata: { memberId },
        ipAddress: ip,
        userAgent: ua,
    });
    logger_1.default.info(`Member removed from project`);
    res.json({
        success: true,
        message: 'Member removed successfully',
    });
});
//# sourceMappingURL=project.controller.js.map