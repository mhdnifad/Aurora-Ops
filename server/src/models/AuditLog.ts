import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: mongoose.Types.ObjectId;
  changes?: Record<string, any>;
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  deletedAt?: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
      // Examples: 'create', 'update', 'delete', 'login', 'logout', etc.
    },
    entityType: {
      type: String,
      required: true,
      // Examples: 'user', 'project', 'task', 'organization', etc.
    },
    entityId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    changes: {
      type: Schema.Types.Mixed,
      default: null,
      // Store before/after values for updates
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound indexes for audit log queries
AuditLogSchema.index({ organizationId: 1, createdAt: -1 });
AuditLogSchema.index({ organizationId: 1, userId: 1, createdAt: -1 });
AuditLogSchema.index({ organizationId: 1, action: 1, createdAt: -1 });
AuditLogSchema.index({ organizationId: 1, entityType: 1, entityId: 1 });

// TTL index: auto-delete audit logs older than 1 year
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // 365 days

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
