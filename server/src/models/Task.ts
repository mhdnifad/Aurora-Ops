import mongoose, { Schema, Document } from 'mongoose';
import { TASK_STATUS, TASK_PRIORITY } from '../config/constants';

export interface ITask extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: typeof TASK_STATUS[keyof typeof TASK_STATUS];
  priority: typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];
  assigneeId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  dueDate?: Date;
  completedAt?: Date;
  tags: string[];
  attachments: Array<{
    _id?: mongoose.Types.ObjectId;
    name: string;
    url: string;
    size: number;
    type: string;
    publicId?: string | null;
    storage?: 'cloudinary' | 'local';
    localPath?: string | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.TODO,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MEDIUM,
      index: true,
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    attachments: [
      new Schema(
        {
          name: { type: String, required: true },
          url: { type: String, required: true },
          size: { type: Number, default: 0 },
          type: { type: String, default: 'application/octet-stream' },
          publicId: { type: String, default: null },
          storage: { type: String, default: 'cloudinary' },
          localPath: { type: String, default: null },
        },
        { _id: true }
      ),
    ],
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
TaskSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
TaskSchema.index({ organizationId: 1, projectId: 1, status: 1 });
TaskSchema.index({ organizationId: 1, assigneeId: 1, status: 1 });
TaskSchema.index({ organizationId: 1, dueDate: 1 });

// Text index for search
TaskSchema.index({ title: 'text', description: 'text' });

// Index for soft delete
TaskSchema.index({ deletedAt: 1 });

export default mongoose.model<ITask>('Task', TaskSchema);
