import mongoose, { Schema, Document } from 'mongoose';
import { PROJECT_STATUS } from '../config/constants';

export interface IProject extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  slug: string;
  icon?: string;
  color?: string;
  status: typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];
  ownerId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [200, 'Project name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    icon: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.ACTIVE,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for tenant queries
ProjectSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

// Index for soft delete
ProjectSchema.index({ deletedAt: 1 });

// Index for project members
ProjectSchema.index({ members: 1 });

export default mongoose.model<IProject>('Project', ProjectSchema);
