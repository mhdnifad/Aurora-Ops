import mongoose, { Schema, Document } from 'mongoose';
import { MEMBERSHIP_STATUS, ORG_ROLES, LEGACY_ROLES } from '../config/constants';

export interface IMembership extends Document {
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  role: string;
  status: typeof MEMBERSHIP_STATUS[keyof typeof MEMBERSHIP_STATUS];
  invitedBy?: mongoose.Types.ObjectId;
  invitedAt: Date;
  joinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const MembershipSchema = new Schema<IMembership>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: [
        ...Object.values(ORG_ROLES),
        ...Object.values(LEGACY_ROLES),
      ],
      default: ORG_ROLES.EMPLOYEE,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(MEMBERSHIP_STATUS),
      default: MEMBERSHIP_STATUS.ACTIVE,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
    joinedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one user per organization
MembershipSchema.index({ userId: 1, organizationId: 1 }, { unique: true });

// Index for querying by organization
MembershipSchema.index({ organizationId: 1, status: 1 });

// Index for querying by user
MembershipSchema.index({ userId: 1, status: 1 });

export default mongoose.model<IMembership>('Membership', MembershipSchema);
