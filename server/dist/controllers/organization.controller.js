"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveOrganization = exports.removeMember = exports.updateMemberRole = exports.inviteMember = exports.getOrganizationMembers = exports.deleteOrganization = exports.updateOrganization = exports.getOrganization = exports.getUserOrganizations = exports.createOrganization = void 0;
const Organization_1 = __importDefault(require("../models/Organization"));
const Membership_1 = __importDefault(require("../models/Membership"));
const User_1 = __importDefault(require("../models/User"));
const helpers_1 = require("../utils/helpers");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const checker_1 = require("../permissions/checker");
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const organization_validation_1 = require("../validations/organization.validation");
const email_service_1 = __importDefault(require("../services/email.service"));
const env_1 = __importDefault(require("../config/env"));
/**
 * Create organization
 */
exports.createOrganization = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { name, description } = req.body;
    // Validate request
    const validation = organization_validation_1.createOrganizationSchema.safeParse({ name, description });
    if (!validation.success) {
        throw new errors_1.ValidationError('Invalid organization data');
    }
    // Check if organization name already exists
    const existingOrg = await Organization_1.default.findOne({ name });
    if (existingOrg) {
        throw new errors_1.ConflictError('Organization name already exists');
    }
    // Create organization
    const org = await Organization_1.default.create({
        name,
        description,
        slug: (0, helpers_1.slugify)(name),
        createdBy: req.user.userId,
    });
    // Add creator as member with Owner role
    await Membership_1.default.create({
        userId: req.user.userId,
        organizationId: org._id,
        role: 'owner',
    });
    logger_1.default.info(`Organization created: ${org.name} by ${req.user.email}`);
    res.status(201).json({
        success: true,
        data: org,
    });
});
/**
 * Get all organizations for user
 */
exports.getUserOrganizations = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    // Get memberships for user
    const memberships = await Membership_1.default.find({ userId: req.user.userId })
        .populate('organizationId')
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));
    const total = await Membership_1.default.countDocuments({ userId: req.user.userId });
    const organizations = memberships.map((m) => m.organizationId);
    res.json({
        success: true,
        data: organizations,
        pagination: (0, helpers_1.paginationMeta)(total, Number(page), Number(limit)),
    });
});
/**
 * Get organization by ID
 */
exports.getOrganization = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const org = await Organization_1.default.findById(id);
    if (!org) {
        throw new errors_1.NotFoundError('Organization not found');
    }
    // Check if user is member
    const membership = await Membership_1.default.findOne({
        userId: req.user.userId,
        organizationId: org._id,
    });
    if (!membership) {
        throw new errors_1.AuthorizationError('You do not have access to this organization');
    }
    res.json({
        success: true,
        data: org,
    });
});
/**
 * Update organization
 */
exports.updateOrganization = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    // Validate request
    const validation = organization_validation_1.updateOrganizationSchema.safeParse({ name, description });
    if (!validation.success) {
        throw new errors_1.ValidationError('Invalid organization data');
    }
    const org = await Organization_1.default.findById(id);
    if (!org) {
        throw new errors_1.NotFoundError('Organization not found');
    }
    // Check permissions
    const canUpdate = await checker_1.PermissionChecker.userHasPermission(req.user.userId, org._id.toString(), 'update_organization');
    if (!canUpdate) {
        throw new errors_1.AuthorizationError('You do not have permission to update this organization');
    }
    // Update organization
    const updatedOrg = await Organization_1.default.findByIdAndUpdate(id, { name, description, slug: name ? (0, helpers_1.slugify)(name) : org.slug }, { new: true, runValidators: true });
    // Log audit
    const fwd = req.headers['x-forwarded-for'] || '';
    const ip = fwd.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    await AuditLog_1.default.create({
        userId: req.user.userId,
        organizationId: org._id,
        action: 'update_organization',
        entityType: 'Organization',
        entityId: org._id,
        metadata: { changes: { name, description } },
        ipAddress: ip,
        userAgent: ua,
    });
    logger_1.default.info(`Organization updated: ${org.name}`);
    res.json({
        success: true,
        data: updatedOrg,
    });
});
/**
 * Delete organization
 */
exports.deleteOrganization = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const org = await Organization_1.default.findById(id);
    if (!org) {
        throw new errors_1.NotFoundError('Organization not found');
    }
    // Check if user is owner
    const membership = await Membership_1.default.findOne({
        userId: req.user.userId,
        organizationId: org._id,
        role: 'owner',
    });
    if (!membership) {
        throw new errors_1.AuthorizationError('Only the organization owner can delete it');
    }
    // Soft delete
    org.deletedAt = new Date();
    await org.save();
    // Log audit
    const fwd = req.headers['x-forwarded-for'] || '';
    const ip = fwd.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    await AuditLog_1.default.create({
        userId: req.user.userId,
        organizationId: org._id,
        action: 'delete_organization',
        entityType: 'Organization',
        entityId: org._id,
        metadata: {},
        ipAddress: ip,
        userAgent: ua,
    });
    logger_1.default.info(`Organization deleted: ${org.name}`);
    res.json({
        success: true,
        message: 'Organization deleted',
    });
});
/**
 * Get organization members
 */
exports.getOrganizationMembers = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const org = await Organization_1.default.findById(id);
    if (!org) {
        throw new errors_1.NotFoundError('Organization not found');
    }
    // Check if user is member
    const userMembership = await Membership_1.default.findOne({
        userId: req.user.userId,
        organizationId: org._id,
    });
    if (!userMembership) {
        throw new errors_1.AuthorizationError('You do not have access to this organization');
    }
    // Get members
    const members = await Membership_1.default.find({ organizationId: org._id })
        .populate('userId', 'firstName lastName email avatar')
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));
    const total = await Membership_1.default.countDocuments({ organizationId: org._id });
    res.json({
        success: true,
        data: members,
        pagination: (0, helpers_1.paginationMeta)(total, Number(page), Number(limit)),
    });
});
/**
 * Invite member to organization
 */
exports.inviteMember = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { email, role } = req.body;
    // Validate request
    const validation = organization_validation_1.inviteMemberSchema.safeParse({ email, role });
    if (!validation.success) {
        throw new errors_1.ValidationError('Invalid invitation data');
    }
    const org = await Organization_1.default.findById(id);
    if (!org) {
        throw new errors_1.NotFoundError('Organization not found');
    }
    // Check permissions
    const canInvite = await checker_1.PermissionChecker.userHasPermission(req.user.userId, org._id.toString(), 'manage_members');
    if (!canInvite) {
        throw new errors_1.AuthorizationError('You do not have permission to invite members');
    }
    // Find user by email
    const user = await User_1.default.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new errors_1.NotFoundError('User not found');
    }
    // Check if already a member
    const existingMembership = await Membership_1.default.findOne({
        userId: user._id,
        organizationId: org._id,
    });
    if (existingMembership) {
        throw new errors_1.ConflictError('User is already a member of this organization');
    }
    // Add member
    const membership = await Membership_1.default.create({
        userId: user._id,
        organizationId: org._id,
        role,
    });
    // Send invitation email (best-effort)
    try {
        if (email_service_1.default.isEnabled()) {
            const inviter = await User_1.default.findById(req.user.userId).select('firstName lastName email');
            const inviterName = inviter ? `${inviter.firstName || ''} ${inviter.lastName || ''}`.trim() || inviter.email : req.user?.email || 'Aurora Ops';
            const inviteUrl = `${env_1.default.frontendUrl}/dashboard`;
            await email_service_1.default.sendTeamInvitationEmail(email, inviterName, org.name, inviteUrl);
        }
        else {
            logger_1.default.warn('Email service not configured; skipping team invitation email');
        }
    }
    catch (e) {
        logger_1.default.error('Error sending team invitation email', e);
    }
    // Log audit
    const fwd = req.headers['x-forwarded-for'] || '';
    const ip = fwd.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    await AuditLog_1.default.create({
        userId: req.user.userId,
        organizationId: org._id,
        action: 'invite_member',
        entityType: 'Membership',
        entityId: membership._id,
        metadata: { email, role },
        ipAddress: ip,
        userAgent: ua,
    });
    logger_1.default.info(`Member invited to organization: ${email} to ${org.name}`);
    res.status(201).json({
        success: true,
        data: await membership.populate('user', 'firstName lastName email avatar'),
    });
});
/**
 * Update member role
 */
exports.updateMemberRole = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id, memberId } = req.params;
    const { role } = req.body;
    const org = await Organization_1.default.findById(id);
    if (!org) {
        throw new errors_1.NotFoundError('Organization not found');
    }
    const membership = await Membership_1.default.findById(memberId);
    if (!membership) {
        throw new errors_1.NotFoundError('Member not found');
    }
    // Check permissions
    const canUpdate = await checker_1.PermissionChecker.userHasPermission(req.user.userId, org._id.toString(), 'manage_members');
    if (!canUpdate) {
        throw new errors_1.AuthorizationError('You do not have permission to update member role');
    }
    // Prevent changing owner role
    if (membership?.role === 'owner') {
        throw new errors_1.AuthorizationError('Cannot change owner role');
    }
    // Update role
    membership.role = role;
    await membership.save();
    // Log audit
    const fwd = req.headers['x-forwarded-for'] || '';
    const ip = fwd.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    await AuditLog_1.default.create({
        userId: req.user.userId,
        organizationId: org._id,
        action: 'update_member_role',
        entityType: 'Membership',
        entityId: membership._id,
        metadata: { role },
        ipAddress: ip,
        userAgent: ua,
    });
    logger_1.default.info(`Member role updated in organization: ${org.name}`);
    res.json({
        success: true,
        data: await membership.populate('user', 'firstName lastName email avatar'),
    });
});
/**
 * Remove member from organization
 */
exports.removeMember = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id, memberId } = req.params;
    const org = await Organization_1.default.findById(id);
    if (!org) {
        throw new errors_1.NotFoundError('Organization not found');
    }
    const membership = await Membership_1.default.findById(memberId);
    if (!membership) {
        throw new errors_1.NotFoundError('Member not found');
    }
    // Check permissions
    const canRemove = await checker_1.PermissionChecker.userHasPermission(req.user.userId, org._id.toString(), 'manage_members');
    if (!canRemove) {
        throw new errors_1.AuthorizationError('You do not have permission to remove members');
    }
    // Prevent removing owner
    if (membership?.role === 'owner') {
        throw new errors_1.AuthorizationError('Cannot remove organization owner');
    }
    // Soft delete member
    membership.deletedAt = new Date();
    await membership.save();
    // Log audit
    const fwd = req.headers['x-forwarded-for'] || '';
    const ip = fwd.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    await AuditLog_1.default.create({
        userId: req.user.userId,
        organizationId: org._id,
        action: 'remove_member',
        entityType: 'Membership',
        entityId: membership._id,
        metadata: {},
        ipAddress: ip,
        userAgent: ua,
    });
    logger_1.default.info(`Member removed from organization: ${org.name}`);
    res.json({
        success: true,
        message: 'Member removed',
    });
});
/**
 * Leave organization
 */
exports.leaveOrganization = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const org = await Organization_1.default.findById(id);
    if (!org) {
        throw new errors_1.NotFoundError('Organization not found');
    }
    // Find membership
    const membership = await Membership_1.default.findOne({
        userId: req.user.userId,
        organizationId: org._id,
    });
    if (!membership) {
        throw new errors_1.NotFoundError('You are not a member of this organization');
    }
    // Prevent owner from leaving
    if (membership.role === 'owner') {
        throw new errors_1.AuthorizationError('Owner cannot leave organization. Transfer ownership first.');
    }
    // Soft delete membership
    membership.deletedAt = new Date();
    await membership.save();
    // Log audit
    const fwd = req.headers['x-forwarded-for'] || '';
    const ip = fwd.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    await AuditLog_1.default.create({
        userId: req.user.userId,
        organizationId: org._id,
        action: 'leave_organization',
        entityType: 'Membership',
        entityId: membership._id,
        metadata: {},
        ipAddress: ip,
        userAgent: ua,
    });
    logger_1.default.info(`User left organization: ${org.name}`);
    res.json({
        success: true,
        message: 'Left organization',
    });
});
//# sourceMappingURL=organization.controller.js.map