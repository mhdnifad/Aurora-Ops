import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import Organization from '../models/Organization';
import Membership from '../models/Membership';
import User from '../models/User';
import { asyncHandler, slugify, paginationMeta } from '../utils/helpers';
import { AuthorizationError, NotFoundError, ValidationError, ConflictError } from '../utils/errors';
import logger from '../utils/logger';
import { PermissionChecker } from '../permissions/checker';
import AuditLog from '../models/AuditLog';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  inviteMemberSchema,
} from '../validations/organization.validation';
import emailService from '../services/email.service';
import config from '../config/env';
import { normalizeOrgRole } from '../utils/roles';
import SocketManager from '../socket';

/**
 * Create organization
 */
export const createOrganization = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;

  // Validate request
  const validation = createOrganizationSchema.safeParse({ name, description });
  if (!validation.success) {
    throw new ValidationError('Invalid organization data');
  }

  // Check if organization name already exists
  const existingOrg = await Organization.findOne({ name, deletedAt: null });
  if (existingOrg) {
    throw new ConflictError('Organization name already exists');
  }

  // Create organization
  const org = await Organization.create({
    name,
    description,
    slug: slugify(name),
    createdBy: req.user!._id,
  });

  // Add creator as member with Owner role
  await Membership.create({
    userId: req.user!._id,
    organizationId: org._id,
    role: 'company_admin',
    status: 'active',
  });

  logger.info(`Organization created: ${org.name} by ${req.user!.email}`);

  res.status(201).json({
    success: true,
    data: org,
  });
});

/**
 * Get all organizations for user
 */
export const getUserOrganizations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  // Get memberships for user
  const memberships = await Membership.find({ 
    userId: req.user!._id,
    status: 'active',
    deletedAt: null,
  })
    .populate({ path: 'organizationId', match: { deletedAt: null } })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Membership.countDocuments({ 
    userId: req.user!._id,
    status: 'active',
    deletedAt: null,
  });

  const organizations = memberships.map((m) => m.organizationId).filter(Boolean);

  res.json({
    success: true,
    data: organizations,
    pagination: paginationMeta(total, Number(page), Number(limit)),
  });
});

/**
 * Get organization by ID
 */
export const getOrganization = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const org = await Organization.findOne({ _id: id, deletedAt: null });
  if (!org) {
    throw new NotFoundError('Organization not found');
  }

  // Check if user is member
  const membership = await Membership.findOne({
    userId: req.user!._id,
    organizationId: org._id,
    deletedAt: null,
  });

  if (!membership) {
    throw new AuthorizationError('You do not have access to this organization');
  }

  res.json({
    success: true,
    data: org,
  });
});

/**
 * Update organization
 */
export const updateOrganization = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  // Validate request
  const validation = updateOrganizationSchema.safeParse({ name, description });
  if (!validation.success) {
    throw new ValidationError('Invalid organization data');
  }

  const org = await Organization.findOne({ _id: id, deletedAt: null });
  if (!org) {
    throw new NotFoundError('Organization not found');
  }

  // Check permissions
  const canUpdate = await PermissionChecker.userHasPermission(req.user!._id, org._id.toString(),
    'update_organization'
  );

  if (!canUpdate) {
    throw new AuthorizationError('You do not have permission to update this organization');
  }

  // Update organization
  const updatedOrg = await Organization.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { name, description, slug: name ? slugify(name) : org.slug },
    { new: true, runValidators: true }
  );

  // Log audit
  const fwd = (req.headers['x-forwarded-for'] as string) || '';
  const ip = fwd.split(',')[0].trim() || (req.socket?.remoteAddress as string) || 'unknown';
  const ua = (req.headers['user-agent'] as string) || 'unknown';
  await AuditLog.create({
    userId: req.user!._id,
    organizationId: org._id,
    action: 'update_organization',
    entityType: 'Organization',
    entityId: org._id,
    metadata: { changes: { name, description } },
    ipAddress: ip,
    userAgent: ua,
  });

  logger.info(`Organization updated: ${org.name}`);

  res.json({
    success: true,
    data: updatedOrg,
  });
});

/**
 * Delete organization
 */
export const deleteOrganization = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const org = await Organization.findOne({ _id: id, deletedAt: null });
  if (!org) {
    throw new NotFoundError('Organization not found');
  }

  // Check if user is owner
  const membership = await Membership.findOne({
    userId: req.user!._id,
    organizationId: org._id,
    role: 'owner',
    deletedAt: null,
  });

  if (!membership) {
    throw new AuthorizationError('Only the organization owner can delete it');
  }

  // Soft delete
  org.deletedAt = new Date();
  await org.save();

  // Log audit
  const fwd = (req.headers['x-forwarded-for'] as string) || '';
  const ip = fwd.split(',')[0].trim() || (req.socket?.remoteAddress as string) || 'unknown';
  const ua = (req.headers['user-agent'] as string) || 'unknown';
  await AuditLog.create({
    userId: req.user!._id,
    organizationId: org._id,
    action: 'delete_organization',
    entityType: 'Organization',
    entityId: org._id,
    metadata: {},
    ipAddress: ip,
    userAgent: ua,
  });

  logger.info(`Organization deleted: ${org.name}`);

  res.json({
    success: true,
    message: 'Organization deleted',
  });
});

/**
 * Get organization members
 */
export const getOrganizationMembers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const org = await Organization.findOne({ _id: id, deletedAt: null });
  if (!org) {
    throw new NotFoundError('Organization not found');
  }

  // Check if user is member
  const userMembership = await Membership.findOne({
    userId: req.user!._id,
    organizationId: org._id,
    deletedAt: null,
  });

  if (!userMembership) {
    throw new AuthorizationError('You do not have access to this organization');
  }

  // Get members
  const members = await Membership.find({ organizationId: org._id, deletedAt: null })
    .populate('userId', 'firstName lastName email avatar')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Membership.countDocuments({ organizationId: org._id, deletedAt: null });

  res.json({
    success: true,
    data: members,
    pagination: paginationMeta(total, Number(page), Number(limit)),
  });
});

/**
 * Invite member to organization
 */
export const inviteMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { email, role } = req.body;

  // Validate request
  const validation = inviteMemberSchema.safeParse({ email, role });
  if (!validation.success) {
    throw new ValidationError('Invalid invitation data');
  }

  const org = await Organization.findOne({ _id: id, deletedAt: null });
  if (!org) {
    throw new NotFoundError('Organization not found');
  }

  // Check permissions
  const canInvite = await PermissionChecker.userHasPermission(req.user!._id, org._id.toString(),
    'manage_members'
  );

  if (!canInvite) {
    throw new AuthorizationError('You do not have permission to invite members');
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase(), deletedAt: null });
  if (!user) {
    throw new ValidationError('User not found');
  }

  // Check if already a member
  const existingMembership = await Membership.findOne({
    userId: user._id,
    organizationId: org._id,
    deletedAt: null,
  });

  if (existingMembership) {
    throw new ConflictError('User is already a member of this organization');
  }

  // Add member
  const membership = await Membership.create({
    userId: user._id,
    organizationId: org._id,
    role,
  });

  // Send invitation email (best-effort)
  try {
    if (emailService.isEnabled()) {
      const inviter = await User.findById(req.user!._id).select('firstName lastName email');
      const inviterName = inviter ? `${inviter.firstName || ''} ${inviter.lastName || ''}`.trim() || inviter.email : req.user!.email || 'Aurora Ops';
      const inviteUrl = `${config.frontendUrl}/dashboard`;
      await emailService.sendTeamInvitationEmail(email, inviterName, org.name, inviteUrl);
    } else {
      logger.warn('Email service not configured; skipping team invitation email');
    }
  } catch (e) {
    logger.error('Error sending team invitation email', e);
  }

  // Log audit
  const fwd = (req.headers['x-forwarded-for'] as string) || '';
  const ip = fwd.split(',')[0].trim() || (req.socket?.remoteAddress as string) || 'unknown';
  const ua = (req.headers['user-agent'] as string) || 'unknown';
  await AuditLog.create({
    userId: req.user!._id,
    organizationId: org._id,
    action: 'invite_member',
    entityType: 'Membership',
    entityId: membership._id,
    metadata: { email, role },
    ipAddress: ip,
    userAgent: ua,
  });

  logger.info(`Member invited to organization: ${email} to ${org.name}`);

  const populatedMembership = await membership.populate('user', 'firstName lastName email avatar');
  const socketManager = SocketManager.getInstance();
  socketManager?.emitOrgEvent(org._id.toString(), 'member:invited', {
    member: populatedMembership,
    organizationId: org._id.toString(),
  });

  res.status(201).json({
    success: true,
    data: populatedMembership,
  });
});

/**
 * Update member role
 */
export const updateMemberRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id, memberId } = req.params;
  const { role } = req.body;

  const org = await Organization.findOne({ _id: id, deletedAt: null });
  if (!org) {
    throw new NotFoundError('Organization not found');
  }

  const membership = await Membership.findOne({ _id: memberId, deletedAt: null });
  if (!membership) {
    throw new NotFoundError('Member not found');
  }

  // Check permissions
  const canUpdate = await PermissionChecker.userHasPermission(req.user!._id, org._id.toString(),
    'manage_members'
  );

  if (!canUpdate) {
    throw new AuthorizationError('You do not have permission to update member role');
  }

  // Prevent changing owner role
  if (normalizeOrgRole(membership.role) === 'company_admin') {
    throw new AuthorizationError('Cannot change owner role');
  }

  // Update role
  membership.role = role;
  await membership.save();

  // Log audit
  const fwd = (req.headers['x-forwarded-for'] as string) || '';
  const ip = fwd.split(',')[0].trim() || (req.socket?.remoteAddress as string) || 'unknown';
  const ua = (req.headers['user-agent'] as string) || 'unknown';
  await AuditLog.create({
    userId: req.user!._id,
    organizationId: org._id,
    action: 'update_member_role',
    entityType: 'Membership',
    entityId: membership._id,
    metadata: { role },
    ipAddress: ip,
    userAgent: ua,
  });

  logger.info(`Member role updated in organization: ${org.name}`);

  const populatedMembership = await membership.populate('user', 'firstName lastName email avatar');
  const socketManager = SocketManager.getInstance();
  socketManager?.emitOrgEvent(org._id.toString(), 'member:role_updated', {
    member: populatedMembership,
    organizationId: org._id.toString(),
  });

  res.json({
    success: true,
    data: populatedMembership,
  });
});

/**
 * Remove member from organization
 */
export const removeMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id, memberId } = req.params;

  const org = await Organization.findOne({ _id: id, deletedAt: null });
  if (!org) {
    throw new NotFoundError('Organization not found');
  }

  const membership = await Membership.findOne({ _id: memberId, deletedAt: null });
  if (!membership) {
    throw new NotFoundError('Member not found');
  }

  // Check permissions
  const canRemove = await PermissionChecker.userHasPermission(req.user!._id, org._id.toString(),
    'manage_members'
  );

  if (!canRemove) {
    throw new AuthorizationError('You do not have permission to remove members');
  }

  // Prevent removing owner
  if (normalizeOrgRole(membership.role) === 'company_admin') {
    throw new AuthorizationError('Cannot remove organization owner');
  }

  // Soft delete member
  membership.deletedAt = new Date();
  await membership.save();

  // Log audit
  const fwd = (req.headers['x-forwarded-for'] as string) || '';
  const ip = fwd.split(',')[0].trim() || (req.socket?.remoteAddress as string) || 'unknown';
  const ua = (req.headers['user-agent'] as string) || 'unknown';
  await AuditLog.create({
    userId: req.user!._id,
    organizationId: org._id,
    action: 'remove_member',
    entityType: 'Membership',
    entityId: membership._id,
    metadata: {},
    ipAddress: ip,
    userAgent: ua,
  });

  logger.info(`Member removed from organization: ${org.name}`);

  const socketManager = SocketManager.getInstance();
  socketManager?.emitOrgEvent(org._id.toString(), 'member:removed', {
    memberId: membership._id,
    userId: membership.userId,
    organizationId: org._id.toString(),
  });

  res.json({
    success: true,
    message: 'Member removed',
  });
});

/**
 * Leave organization
 */
export const leaveOrganization = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const org = await Organization.findOne({ _id: id, deletedAt: null });
  if (!org) {
    throw new NotFoundError('Organization not found');
  }

  // Find membership
  const membership = await Membership.findOne({
    userId: req.user!._id,
    organizationId: org._id,
    deletedAt: null,
  });

  if (!membership) {
    throw new NotFoundError('You are not a member of this organization');
  }

  // Prevent owner from leaving
  if (normalizeOrgRole(membership.role) === 'company_admin') {
    throw new AuthorizationError('Owner cannot leave organization. Transfer ownership first.');
  }

  // Soft delete membership
  membership.deletedAt = new Date();
  await membership.save();

  // Log audit
  const fwd = (req.headers['x-forwarded-for'] as string) || '';
  const ip = fwd.split(',')[0].trim() || (req.socket?.remoteAddress as string) || 'unknown';
  const ua = (req.headers['user-agent'] as string) || 'unknown';
  await AuditLog.create({
    userId: req.user!._id,
    organizationId: org._id,
    action: 'leave_organization',
    entityType: 'Membership',
    entityId: membership._id,
    metadata: {},
    ipAddress: ip,
    userAgent: ua,
  });

  logger.info(`User left organization: ${org.name}`);

  const socketManager = SocketManager.getInstance();
  socketManager?.emitOrgEvent(org._id.toString(), 'member:left', {
    memberId: membership._id,
    userId: membership.userId,
    organizationId: org._id.toString(),
  });

  res.json({
    success: true,
    message: 'Left organization',
  });
});

