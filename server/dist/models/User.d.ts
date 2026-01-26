import mongoose, { Document } from 'mongoose';
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
    apiKeys?: Array<{
        _id?: any;
        token: string;
        label: string;
        createdAt: Date;
        lastUsedAt?: Date;
        revokedAt?: Date;
    }>;
    fullName: string;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default _default;
//# sourceMappingURL=User.d.ts.map