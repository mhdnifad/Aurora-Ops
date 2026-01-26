import mongoose, { Schema, Document } from 'mongoose';
import { ORGANIZATION_PLAN } from '../config/constants';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  description?: string;
  plan: typeof ORGANIZATION_PLAN[keyof typeof ORGANIZATION_PLAN];
  settings: {
    timezone?: string;
    dateFormat?: string;
    language?: string;
  };
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
  subscriptionEndDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: [100, 'Organization name cannot exceed 100 characters'],
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
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    plan: {
      type: String,
      enum: Object.values(ORGANIZATION_PLAN),
      default: ORGANIZATION_PLAN.FREE,
    },
    settings: {
      timezone: {
        type: String,
        default: 'UTC',
      },
      dateFormat: {
        type: String,
        default: 'MM/DD/YYYY',
      },
      language: {
        type: String,
        default: 'en',
      },
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing'],
      default: null,
    },
    subscriptionEndDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
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

// Index for soft delete queries
OrganizationSchema.index({ deletedAt: 1 });

// Compound index for organization lookup
OrganizationSchema.index({ slug: 1, deletedAt: 1 });

export default mongoose.model<IOrganization>('Organization', OrganizationSchema);
