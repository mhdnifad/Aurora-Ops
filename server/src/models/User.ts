import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLoginAt?: Date;
  preferences?: {
    language?: string;
    timezone?: string;
    theme?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      inApp?: boolean;
    };
    emailDigest?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  systemRole?: 'admin' | 'user';
  apiKeys?: Array<{
    _id?: mongoose.Types.ObjectId;
    token: string;
    label: string;
    createdAt: Date;
    lastUsedAt?: Date;
    revokedAt?: Date;
  }>;
  
  // Virtual: fullName
  fullName: string;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    avatar: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    systemRole: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      index: true,
    },
    preferences: {
      type: {
        language: { type: String, default: 'en' },
        timezone: { type: String, default: 'UTC' },
        theme: { type: String, default: 'light' },
        notifications: {
          email: { type: Boolean, default: true },
          push: { type: Boolean, default: true },
          inApp: { type: Boolean, default: true },
        },
        emailDigest: { type: String, default: 'daily' },
      },
      default: {},
    },
    apiKeys: [
      {
        token: { type: String, select: false },
        label: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        lastUsedAt: { type: Date, default: null },
        revokedAt: { type: Date, default: null },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: fullName
UserSchema.virtual('fullName').get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Index for soft delete queries
UserSchema.index({ deletedAt: 1 });

// Index for email verification
UserSchema.index({ emailVerificationToken: 1, emailVerificationExpires: 1 });

// Index for password reset
UserSchema.index({ resetPasswordToken: 1, resetPasswordExpires: 1 });

export default mongoose.model<IUser>('User', UserSchema);
