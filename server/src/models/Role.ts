import mongoose, { Schema, Document } from 'mongoose';
// import ROLES } from '../config/constants';

export interface IRole extends Document {
  name: string;
  displayName: string;
  description: string;
  organizationId: mongoose.Types.ObjectId;
  permissions: string[];
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    isSystemRole: {
      type: Boolean,
      default: false,
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

// Compound unique index: role name per organization
RoleSchema.index({ name: 1, organizationId: 1 }, { unique: true });

export default mongoose.model<IRole>('Role', RoleSchema);
